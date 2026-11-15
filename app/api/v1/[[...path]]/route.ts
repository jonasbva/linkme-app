import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest, runWithApiPrincipal, recordApiRequest } from '@/lib/api-access'
import { API_ROUTES, API_REQUEST_EXAMPLES, ApiMethod, findApiRoute, validateApiRequest, validateRelatedRows } from '@/lib/api-routes'
import { requireSuperAdmin, guardResponse } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

const failure = (error: string, status: number) => NextResponse.json({ error }, { status })

async function handle(request: NextRequest, context: { params: { path?: string[] } }) {
  let auth: Awaited<ReturnType<typeof authenticateApiRequest>>
  try { auth = await authenticateApiRequest(request) }
  catch { return noStore(failure('API authentication is temporarily unavailable.', 503)) }
  if (!auth.ok) return noStore(failure(auth.error, auth.status))

  const started = Date.now()
  const segments = context.params.path || []
  let auditPath = '/api/v1/<unrecognized>'
  const method = request.method as ApiMethod
  let response: Response
  try {
    response = await runWithApiPrincipal(auth.principal, async () => {
      if (segments.length === 0) {
        auditPath = '/api/v1'
        if (method !== 'GET') return methodNotAllowed(['GET'])
        return NextResponse.json({
          version: 'v1', authentication: 'Authorization: Bearer <API_KEY>',
          permissions: 'Every request uses the key owner’s current dashboard permissions. API keys cannot administer access or integration secrets.',
          routes: API_ROUTES.map(route => ({ path: `/api/v1/${route.path}`, methods: Object.entries(route.methods).map(([method, requiredPermissions]) => ({ method, requiredPermissions })), description: route.description, ...(API_REQUEST_EXAMPLES[route.path] ? { requestExamples: API_REQUEST_EXAMPLES[route.path] } : {}), ...(route.warning ? { warning: route.warning } : {}) })),
        })
      }
      const match = findApiRoute(segments)
      if (!match) return failure('API route not found.', 404)
      const { route, params } = match
      auditPath = `/api/v1/${route.path}`
      if (!route.methods[method]) return methodNotAllowed(Object.keys(route.methods))
      if (route.superAdminMethods?.includes(method)) {
        const gate = await requireSuperAdmin()
        if (!gate.ok) return guardResponse(gate)
      }

      let body: Record<string, any> | undefined
      let delegated = request
      if ((method !== 'GET' && method !== 'DELETE') || (method === 'DELETE' && request.body)) {
        if (route.path === 'upload') {
          if (Number(request.headers.get('content-length') || 0) > 11 * 1024 * 1024) return failure('Upload exceeds 10 MB.', 413)
          const bytes = await readBoundedBody(request, 11 * 1024 * 1024)
          const buffered = new NextRequest(request.url, { method, headers: request.headers, body: bytes })
          let form: FormData
          try { form = await buffered.formData() } catch { return failure('Malformed multipart upload.', 400) }
          const file = form.get('file')
          if (!file || typeof file === 'string') return failure('A file is required.', 400)
          if (file.size > 10 * 1024 * 1024) return failure('File too large (maximum 10 MB).', 413)
          if (form.has('bucket') && !['creators', 'images'].includes(String(form.get('bucket')))) return failure('Only creators and images buckets are available through this API.', 400)
          if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) return failure('Only PNG, JPEG, WebP and GIF images are accepted.', 400)
          const signatureBytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())
          const signature = String.fromCharCode(...signatureBytes)
          const validImage = file.type === 'image/png' ? signatureBytes[0] === 137 && signature.slice(1, 8) === 'PNG\r\n\x1a\n' : file.type === 'image/jpeg' ? signatureBytes[0] === 255 && signatureBytes[1] === 216 && signatureBytes[2] === 255 : file.type === 'image/gif' ? /^(GIF87a|GIF89a)/.test(signature) : signature.startsWith('RIFF') && signature.slice(8, 12) === 'WEBP'
          if (!validImage) return failure('The file contents do not match the image type.', 400)
          if (!form.has('bucket')) form.set('bucket', 'creators')
          const headers = new Headers(request.headers)
          headers.delete('content-type'); headers.delete('content-length')
          delegated = new NextRequest(request.url, { method, headers, body: form })
        } else {
          const bytes = await readBoundedBody(request, 1024 * 1024)
          const raw = new TextDecoder().decode(bytes)
          if (raw.length) {
            if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) return failure('Content-Type must be application/json.', 415)
            try { body = JSON.parse(raw) } catch { return failure('Malformed JSON body.', 400) }
            if (!body || Array.isArray(body) || typeof body !== 'object') return failure('JSON body must be an object.', 400)
          } else if (!['revenue/cache', 'infloww/sync-links'].includes(route.path) && method !== 'DELETE') return failure('A JSON object body is required.', 400)
          const headers = new Headers(request.headers)
          headers.delete('content-length')
          delegated = new NextRequest(request.url, { method, headers, ...(raw.length ? { body: raw } : {}) })
        }
      }
      const invalid = validateApiRequest(route.path, method, params, request.nextUrl.searchParams, body)
      if (invalid) return failure(invalid, 400)
      const relatedError = await validateRelatedRows(route.path, body)
      if (relatedError) return relatedError
      const handler = (await route.load())[method] as ((req: NextRequest, context: { params: Record<string, string> }) => Promise<Response>) | undefined
      if (!handler) return failure('API operation is unavailable.', 503)
      return handler(delegated, { params })
    })
    // Older handlers sometimes return database/upstream messages on failure.
    // Preserve status while keeping operational internals out of this API.
    if (response.status >= 500) response = failure('The dashboard could not complete this request.', response.status)
  } catch (error) {
    response = error instanceof BodyTooLarge ? failure('Request body exceeds the supported size.', 413) : error instanceof SyntaxError ? failure('Malformed JSON body.', 400) : failure('The dashboard could not complete this request.', 500)
  }
  try { await recordApiRequest(auth.principal, { method, path: auditPath, status: response.status, durationMs: Date.now() - started }) }
  catch { console.error('API request audit could not be recorded') }
  return noStore(response)
}

class BodyTooLarge extends Error {}
async function readBoundedBody(request: NextRequest, maximum: number): Promise<Uint8Array<ArrayBuffer>> {
  if (Number(request.headers.get('content-length') || 0) > maximum) throw new BodyTooLarge()
  if (!request.body) return new Uint8Array()
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maximum) { void reader.cancel().catch(() => {}); throw new BodyTooLarge() }
      chunks.push(value)
    }
  } finally { reader.releaseLock() }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
  return bytes
}

function methodNotAllowed(methods: string[]) {
  return NextResponse.json({ error: 'Method not allowed.' }, { status: 405, headers: { Allow: methods.join(', ') } })
}
function noStore(response: Response) {
  response.headers.set('Cache-Control', 'private, no-store')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  return response
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
export const HEAD = handle
export const OPTIONS = handle
