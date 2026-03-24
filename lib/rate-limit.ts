/**
 * Rate limiter using Upstash Redis REST API.
 *
 * Setup:
 * 1. In your Vercel dashboard → Integrations → Add Upstash Redis
 * 2. It auto-sets UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars
 *
 * Uses a sliding window algorithm: each IP gets `max` requests per `windowSeconds`.
 * Falls back to allowing requests if Redis is unavailable (fail-open).
 */

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number // epoch seconds when the window resets
}

interface RateLimitConfig {
  max: number           // max requests per window
  windowSeconds: number // window size in seconds
}

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

async function redisCommand(command: string[]): Promise<unknown> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null

  const res = await fetch(`${UPSTASH_URL}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    cache: 'no-store',
  })

  if (!res.ok) return null
  const data = await res.json()
  return data.result
}

/**
 * Pipeline multiple Redis commands in a single HTTP request.
 * Upstash supports this via POST to /pipeline
 */
async function redisPipeline(commands: string[][]): Promise<unknown[] | null> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null

  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
    cache: 'no-store',
  })

  if (!res.ok) return null
  const data = await res.json()
  return data.map((r: { result: unknown }) => r.result)
}

/**
 * Check rate limit for a given identifier (usually IP address).
 *
 * Algorithm: sliding window counter using Redis INCR + EXPIRE.
 * - Key format: `rl:{prefix}:{ip}:{windowId}`
 * - windowId = Math.floor(now / windowSeconds)
 * - If count > max, reject. Otherwise allow.
 */
export async function rateLimit(
  identifier: string,
  prefix: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { max, windowSeconds } = config

  // Fail-open: if Redis is not configured, allow all requests
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return { success: true, remaining: max, reset: 0 }
  }

  try {
    const now = Math.floor(Date.now() / 1000)
    const windowId = Math.floor(now / windowSeconds)
    const key = `rl:${prefix}:${identifier}:${windowId}`
    const reset = (windowId + 1) * windowSeconds

    // INCR the key and set expiry in one pipeline call
    const results = await redisPipeline([
      ['INCR', key],
      ['EXPIRE', key, String(windowSeconds + 1)], // +1s buffer
    ])

    if (!results) {
      return { success: true, remaining: max, reset: 0 }
    }

    const count = results[0] as number
    const remaining = Math.max(0, max - count)

    return {
      success: count <= max,
      remaining,
      reset,
    }
  } catch (err) {
    // Fail-open: don't block users if Redis is down
    console.error('Rate limit error:', err)
    return { success: true, remaining: max, reset: 0 }
  }
}

/**
 * Extract client IP from a Next.js request.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1'
  )
}
