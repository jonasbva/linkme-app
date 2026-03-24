import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSessionUser } from '@/lib/auth'

// Use a clean Supabase client for storage (no custom fetch override)
function createStorageClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}

// Allow up to 10MB uploads
export const runtime = 'nodejs'
export const maxDuration = 30

// POST /api/admin/upload
// Accepts multipart form data with a "file" field
// Returns { url: string } — the public Supabase Storage URL
export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const bucket = (formData.get('bucket') as string) || 'images'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })

    // Sanitize extension: only allow alphanumeric chars
    const rawExt = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
    const ext = rawExt || 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Map common types that browsers may not report correctly
    const contentType = file.type || (ext === 'webp' ? 'image/webp' : ext === 'png' ? 'image/png' : 'image/jpeg')

    const supabase = createStorageClient()

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filename, buffer, { contentType, upsert: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filename)

    return NextResponse.json({ url: publicUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 })
  }
}
