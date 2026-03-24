import { NextRequest, NextResponse } from 'next/server'
import { logError } from '@/lib/error-logging'

/**
 * POST /api/error-log
 * Receives client-side error reports from the ErrorBoundary component.
 * Logs them to the Supabase error_logs table.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, stack, context, componentStack, url, userAgent } = body

    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 })
    }

    await logError({
      message,
      stack: [stack, componentStack].filter(Boolean).join('\n\n--- Component Stack ---\n'),
      context: context || 'client',
      url,
      user_agent: userAgent,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to log error' }, { status: 500 })
  }
}
