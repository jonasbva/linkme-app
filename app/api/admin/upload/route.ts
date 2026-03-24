import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'

function isAdmin() {
  return cookies().get('admin_auth')?.value === 'true'
}

// POST /api/admin/upload
// Accepts multipart form data with a "file" field
// Returns { url: string } — the public Supabase Storage URL
export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const bucket = (formData.get('bucket') as string) || 'images'

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  // Sanitize extension: only allow alphanumeric chars
  const rawExt = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const ext = rawExt || 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const supabase = createServerSupabaseClient()

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, { contentType: file.type || 'image/jpeg', upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filename)

  return NextResponse.json({ url: publicUrl })
}
