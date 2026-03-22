import { NextRequest, NextResponse } from 'next/server'

/**
 * Bounce page that forces in-app browsers (Instagram, Facebook, etc.)
 * to open the target URL in the native/system browser.
 *
 * On iOS: uses an intent-like approach with a meta refresh + JS fallback.
 * On Android: uses intent:// scheme to launch the default browser.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 })
  }

  // Validate the URL to prevent open redirects to javascript: etc.
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return new NextResponse('Invalid URL', { status: 400 })
    }
  } catch {
    return new NextResponse('Invalid URL', { status: 400 })
  }

  const escapedUrl = url.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // HTML bounce page that tries multiple methods to break out of in-app browsers
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Opening...</title>
  <style>
    body {
      background: #080808;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      text-align: center;
    }
    .container { padding: 20px; }
    .spinner {
      width: 24px; height: 24px;
      border: 2px solid rgba(255,255,255,0.1);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    p { font-size: 14px; color: rgba(255,255,255,0.5); margin: 0 0 20px; }
    a {
      display: inline-block;
      padding: 12px 24px;
      background: #fff;
      color: #000;
      text-decoration: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <p>Opening in your browser...</p>
    <a href="${escapedUrl}" target="_blank" rel="noopener noreferrer">Tap here if not redirected</a>
  </div>
  <script>
    (function() {
      var url = ${JSON.stringify(url)};
      var ua = navigator.userAgent || '';
      var isAndroid = /Android/i.test(ua);
      var isIOS = /iPhone|iPad|iPod/i.test(ua);

      if (isAndroid) {
        // Android: intent scheme opens in the default browser
        var intent = 'intent://' + url.replace(/^https?:\\/\\//, '') +
          '#Intent;scheme=https;action=android.intent.action.VIEW;end';
        window.location.href = intent;
      } else if (isIOS) {
        // iOS: Try x-safari scheme, then fall back to direct navigation
        // Safari handler: open URL directly — this leaves the IG browser
        window.location.href = url;
      } else {
        window.location.href = url;
      }

      // Fallback: if nothing happened after 2s, just navigate
      setTimeout(function() {
        window.location.href = url;
      }, 2000);
    })();
  </script>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
