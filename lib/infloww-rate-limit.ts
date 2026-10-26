// Shared throttle for every Infloww call.
//
// Infloww allows 5 requests/second per key and 60/minute per agency. Both the
// live revenue route and the revenue-cache rebuild used to carry their own copy
// of this, each leaving a 600ms gap between requests AND running them strictly
// one at a time — a full pull took well over a minute and got cut off by the
// function timeout. One module now, so a fix lands in both places.
//
// The per-minute ceiling is the binding constraint on a big pull, not the gap,
// so expect a full refresh to take a while regardless; the callers set
// maxDuration accordingly and the cache spares the interactive path.

const MIN_REQUEST_GAP_MS = 220          // ~4.5 req/sec
const MAX_REQUESTS_PER_MINUTE = 55
const MAX_CONCURRENT_REQUESTS = 4

let lastRequestTime = 0
const requestTimestamps: number[] = []

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Slots are handed out one at a time so two callers can never claim the same
// gap; the fetches themselves overlap.
let scheduleChain: Promise<void> = Promise.resolve()
function reserveSlot(): Promise<void> {
  const next = scheduleChain.then(async () => {
    const now = Date.now()
    while (requestTimestamps.length > 0 && requestTimestamps[0] < now - 60000) {
      requestTimestamps.shift()
    }
    if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
      await sleep(Math.max(0, requestTimestamps[0] + 60000 - Date.now() + 100))
    }
    const elapsed = Date.now() - lastRequestTime
    if (elapsed < MIN_REQUEST_GAP_MS) await sleep(MIN_REQUEST_GAP_MS - elapsed)
    lastRequestTime = Date.now()
    requestTimestamps.push(lastRequestTime)
  })
  scheduleChain = next.catch(() => {})
  return next
}

let inFlight = 0
const concurrencyWaiters: (() => void)[] = []
async function acquireSlot() {
  if (inFlight >= MAX_CONCURRENT_REQUESTS) {
    await new Promise<void>((resolve) => concurrencyWaiters.push(resolve))
  }
  inFlight++
}
function releaseSlot() {
  inFlight--
  concurrencyWaiters.shift()?.()
}

/** Fetch against Infloww, throttled to stay inside its published limits. */
export async function rateLimitedFetch(
  url: string,
  headers: Record<string, string>,
  maxRetries = 3
): Promise<Response> {
  await reserveSlot()
  await acquireSlot()
  let response: Response
  try {
    response = await fetch(url, { headers, cache: 'no-store' })
  } finally {
    releaseSlot()
  }

  if (response.status === 429) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const retryAfter = parseInt(response.headers.get('retry-after') || '0', 10)
      const backoffMs = Math.max(retryAfter * 1000, attempt * 2000)
      console.warn(`Infloww rate limited (429). Retrying in ${backoffMs}ms (attempt ${attempt}/${maxRetries})`)
      await sleep(backoffMs)
      await reserveSlot()
      await acquireSlot()
      let retryResponse: Response
      try {
        retryResponse = await fetch(url, { headers, cache: 'no-store' })
      } finally {
        releaseSlot()
      }
      if (retryResponse.status !== 429) return retryResponse
    }
    throw new Error('Infloww API rate limit exceeded after multiple retries. Please wait a minute and try again.')
  }

  return response
}

/** Run `fn` over `items` with at most `limit` running at once, preserving order. */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let cursor = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await fn(items[index], index)
    }
  })
  await Promise.all(workers)
  return results
}

/** Creators processed at once; the fetch throttle above is the real limit. */
export const CREATOR_CONCURRENCY = 6
