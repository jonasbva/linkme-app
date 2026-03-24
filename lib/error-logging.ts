/**
 * Error logging utility — logs errors to a Supabase `error_logs` table.
 *
 * Table schema (run this in Supabase SQL editor):
 *
 * CREATE TABLE IF NOT EXISTS error_logs (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   message text NOT NULL,
 *   stack text,
 *   context text,       -- e.g. "api/track", "admin/CreatorEditor"
 *   url text,
 *   user_agent text,
 *   created_at timestamptz DEFAULT now()
 * );
 *
 * -- Auto-cleanup: keep only last 30 days
 * -- (Set up a Supabase cron or pg_cron job to DELETE WHERE created_at < now() - interval '30 days')
 */

import { createServerSupabaseClient } from '@/lib/supabase'

interface ErrorLogEntry {
  message: string
  stack?: string
  context?: string   // which route or component
  url?: string
  user_agent?: string
}

/**
 * Log an error to the error_logs table.
 * Fire-and-forget — never throws, never blocks the response.
 */
export async function logError(entry: ErrorLogEntry): Promise<void> {
  try {
    const supabase = createServerSupabaseClient()
    await supabase.from('error_logs').insert({
      message: entry.message.slice(0, 2000),   // cap length
      stack: entry.stack?.slice(0, 5000),
      context: entry.context?.slice(0, 200),
      url: entry.url?.slice(0, 2000),
      user_agent: entry.user_agent?.slice(0, 500),
    })
  } catch (e) {
    // Last resort — don't let error logging break the app
    console.error('Failed to log error to Supabase:', e)
  }
}

/**
 * Helper to extract useful info from an Error object.
 */
export function errorToEntry(
  error: unknown,
  context?: string,
  req?: { url?: string; headers?: Headers }
): ErrorLogEntry {
  const err = error instanceof Error ? error : new Error(String(error))
  return {
    message: err.message,
    stack: err.stack,
    context,
    url: req?.url,
    user_agent: req?.headers?.get?.('user-agent') || undefined,
  }
}
