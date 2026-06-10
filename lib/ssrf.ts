// SSRF guards shared by routes that make outbound requests to user-supplied
// hosts (proxy-image, check-domain).

// Hosts whose A/AAAA records (or literals) must never be fetched: loopback,
// private ranges, link-local (incl. the 169.254.169.254 cloud metadata
// endpoint), CGNAT, and any IPv6 literal.
export function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '')

  if (host === 'localhost' || host.endsWith('.localhost')) return true
  if (host === '' ) return true

  // IPv6 literal (contains a colon) — block all (covers ::1, fc00::/7, fe80::/10, etc.)
  if (host.includes(':')) return true

  // IPv4 literal
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (m) {
    const a = Number(m[1]), b = Number(m[2])
    if (a === 0) return true
    if (a === 10) return true                       // private
    if (a === 127) return true                      // loopback
    if (a === 169 && b === 254) return true         // link-local + metadata
    if (a === 172 && b >= 16 && b <= 31) return true // private
    if (a === 192 && b === 168) return true         // private
    if (a === 100 && b >= 64 && b <= 127) return true // CGNAT
    if (a >= 224) return true                       // multicast / reserved
    return false                                    // public IP literal
  }

  return false
}

// Instagram / Facebook CDN hosts that the IG scraper returns for post media
// (displayUrl) and avatars (profilePicUrl). Suffix-matched.
const IMAGE_HOST_SUFFIXES = ['.cdninstagram.com', '.fbcdn.net']

// Validate a URL the proxy-image route is asked to fetch. Returns the parsed
// URL when safe, or null when it must be rejected.
export function validateProxyImageUrl(raw: string): URL | null {
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:') return null

  const host = parsed.hostname.toLowerCase()
  const allowed = IMAGE_HOST_SUFFIXES.some(s => host === s.slice(1) || host.endsWith(s))
  if (!allowed) return null

  // Belt-and-suspenders: an allowlisted host can't be an IP literal, but guard anyway.
  if (isBlockedHost(host)) return null

  return parsed
}
