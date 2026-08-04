import { NextRequest, NextResponse } from 'next/server'
import { verifyManagementMcpToken } from '@/lib/auth'
import { TOOL_DEFS, callConversionTool } from '@/lib/conversion-dataset'

/**
 * Boese VA — management MCP server (remote, read-only).
 *
 * Speaks MCP over Streamable HTTP so management can add it as a *custom connector*
 * in Claude / Cowork with nothing to install: the connector only needs a URL.
 *
 * Auth (fails CLOSED — no MANAGEMENT_MCP_TOKEN env var means nothing is authorized):
 *   1. Authorization: Bearer <token>   (preferred; needs the request-header beta)
 *   2. X-Api-Key / X-Auth-Token: <token>
 *   3. POST /api/mcp/<token>           (fallback — works with a URL-only connector UI)
 *
 * Read-only by construction: every tool goes through callConversionTool, which
 * only ever SELECTs. There is no write path in this route.
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SERVER_INFO = { name: 'boese-fan-counts', version: '1.0.0' }
const FALLBACK_PROTOCOL = '2025-06-18'

// ── JSON-RPC plumbing ──

type JsonRpcId = string | number | null

interface JsonRpcRequest {
  jsonrpc?: string
  id?: JsonRpcId
  method?: string
  params?: Record<string, any>
}

function result(id: JsonRpcId, value: unknown) {
  return { jsonrpc: '2.0', id, result: value }
}

function error(id: JsonRpcId, code: number, message: string) {
  return { jsonrpc: '2.0', id, error: { code, message } }
}

/**
 * Streamable HTTP lets the server answer with either a single JSON object or an
 * SSE stream. We always send one response, but honour `Accept: text/event-stream`
 * because some clients negotiate strictly.
 */
function respond(payload: unknown, wantsSse: boolean): NextResponse {
  if (!wantsSse) {
    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'no-store' },
    })
  }
  const body = `event: message\ndata: ${JSON.stringify(payload)}\n\n`
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      Connection: 'keep-alive',
    },
  })
}

// ── Token extraction ──

function extractToken(req: NextRequest, pathSegments: string[]): string | null {
  const auth = req.headers.get('authorization')
  if (auth) {
    const prefix = 'Bearer '
    return auth.startsWith(prefix) ? auth.slice(prefix.length).trim() : auth.trim()
  }
  const apiKey = req.headers.get('x-api-key') || req.headers.get('x-auth-token')
  if (apiKey) return apiKey.trim()

  // URL fallback: /api/mcp/<token>  (also tolerates /api/mcp/<token>/mcp)
  for (const seg of pathSegments) {
    if (seg && seg !== 'mcp') return decodeURIComponent(seg)
  }
  return null
}

// ── Handlers ──

async function handleRpc(msg: JsonRpcRequest): Promise<unknown | null> {
  const id = msg.id ?? null
  const method = msg.method || ''

  // Notifications carry no id and get no response body.
  const isNotification = msg.id === undefined || msg.id === null

  switch (method) {
    case 'initialize': {
      const requested = msg.params?.protocolVersion
      return result(id, {
        // Echo the client's version when it sends one, so we stay compatible as
        // the spec moves rather than pinning to whatever was current at build time.
        protocolVersion: typeof requested === 'string' && requested ? requested : FALLBACK_PROTOCOL,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions:
          'Read-only access to the MAHO tracking dashboard: daily new-subscriber ("fan") counts per ' +
          'creator account, their daily targets, streaks, and which days are still missing an entry. ' +
          'Call list_creators first to learn the exact creator names and account handles.',
      })
    }

    case 'ping':
      return result(id, {})

    case 'tools/list':
      return result(id, {
        tools: TOOL_DEFS.map(t => ({
          name: t.name,
          title: t.title,
          description: t.description,
          inputSchema: t.inputSchema,
        })),
      })

    case 'tools/call': {
      const name = msg.params?.name
      const args = (msg.params?.arguments || {}) as Record<string, any>
      if (typeof name !== 'string') return error(id, -32602, 'params.name (tool name) is required.')
      try {
        const value = await callConversionTool(name, args)
        return result(id, {
          content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
          structuredContent: value,
          isError: false,
        })
      } catch (e: any) {
        // Tool-level failures are reported in-band so Claude can retry or explain,
        // rather than as a protocol error.
        return result(id, {
          content: [{ type: 'text', text: `Error: ${e?.message || String(e)}` }],
          isError: true,
        })
      }
    }

    // Nothing to do, but they must not 404.
    case 'notifications/initialized':
    case 'notifications/cancelled':
      return null

    case 'resources/list':
      return result(id, { resources: [] })
    case 'prompts/list':
      return result(id, { prompts: [] })

    default:
      if (isNotification) return null
      return error(id, -32601, `Method not found: ${method}`)
  }
}

export async function POST(req: NextRequest, ctx: { params: { path?: string[] } }) {
  const segments = ctx.params?.path || []
  const wantsSse = (req.headers.get('accept') || '').includes('text/event-stream')

  // NOTE: deliberately no WWW-Authenticate header — sending one makes Claude
  // start an OAuth discovery flow, which this server does not implement, and the
  // resulting error is far more confusing than a plain 401.
  if (!verifyManagementMcpToken(extractToken(req, segments))) {
    return NextResponse.json(
      error(null, -32001, 'Unauthorized: missing or invalid access token.'),
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return respond(error(null, -32700, 'Parse error: body is not valid JSON.'), wantsSse)
  }

  // Tolerate a JSON-RPC batch even though current MCP no longer sends one.
  if (Array.isArray(body)) {
    const out = (await Promise.all((body as JsonRpcRequest[]).map(handleRpc))).filter(r => r !== null)
    if (out.length === 0) return new NextResponse(null, { status: 202 })
    return respond(out, wantsSse)
  }

  const response = await handleRpc((body || {}) as JsonRpcRequest)
  if (response === null) return new NextResponse(null, { status: 202 })
  return respond(response, wantsSse)
}

/**
 * Streamable HTTP uses GET to open a server→client notification stream. This
 * server is stateless and never pushes anything, so we decline it; clients treat
 * 405 as "no stream available" and carry on with POST only.
 */
export async function GET() {
  return NextResponse.json({ error: 'method_not_allowed' }, { status: 405, headers: { Allow: 'POST' } })
}

export async function DELETE() {
  // Session teardown — nothing to tear down, but answer cleanly.
  return new NextResponse(null, { status: 204 })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key, X-Auth-Token, Mcp-Session-Id, Mcp-Protocol-Version',
      'Access-Control-Max-Age': '86400',
    },
  })
}
