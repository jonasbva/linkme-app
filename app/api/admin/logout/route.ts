import { NextResponse } from 'next/server'

export async function GET() {
  const res = NextResponse.redirect(new URL('/admin/login', 'http://localhost'))
  res.cookies.delete('admin_auth')
  return res
}
