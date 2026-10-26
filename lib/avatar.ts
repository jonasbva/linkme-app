/**
 * Resolve an avatar URL to something an <img> can actually load.
 *
 * Creator avatars come from Instagram now (refreshed on every scrape, see
 * refreshCreatorAvatar in lib/scraper.ts). Instagram's CDN rejects plain
 * hotlinks, so those have to go through the SSRF-guarded image proxy; anything
 * else — a Supabase upload, say — is already servable and passes through.
 */
const PROXIED_HOSTS = ['cdninstagram.com', 'fbcdn.net']

export function avatarSrc(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  let host: string
  try {
    host = new URL(url).hostname.toLowerCase()
  } catch {
    return url // relative or malformed — leave it to the browser
  }
  const needsProxy = PROXIED_HOSTS.some(h => host === h || host.endsWith('.' + h))
  return needsProxy ? `/api/admin/proxy-image?url=${encodeURIComponent(url)}` : url
}
