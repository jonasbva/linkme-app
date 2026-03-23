import { NextRequest, NextResponse } from 'next/server'

/**
 * Bounce page for in-app browsers.
 * On Android: uses intent:// to open native browser.
 * On iOS: can't escape programmatically — shows a prompt to open in Safari.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 })
  }

  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return new NextResponse('Invalid URL', { status: 400 })
    }
  } catch (_) {
    return new NextResponse('Invalid URL', { status: 400 })
  }

  const escapedUrl = url.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Opening...</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #080808;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 24px;
    }
    .container { max-width: 340px; width: 100%; }
    .spinner {
      width: 28px; height: 28px;
      border: 2.5px solid rgba(255,255,255,0.08);
      border-top-color: rgba(255,255,255,0.7);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Android: auto-redirect, just show spinner */
    .android-msg { display: none; }

    /* iOS: show prompt to open in Safari */
    .ios-msg { display: none; }
    .ios-msg h2 {
      font-size: 18px; font-weight: 700; color: #fff;
      margin-bottom: 10px;
    }
    .ios-msg p {
      font-size: 14px; color: rgba(255,255,255,0.5);
      line-height: 1.6; margin-bottom: 20px;
    }
    .ios-msg .arrow-hint {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 10px 18px;
      font-size: 13px; color: rgba(255,255,255,0.6);
      margin-bottom: 24px;
    }
    .ios-msg .dots-icon {
      font-size: 20px; letter-spacing: 1px; font-weight: 700;
      color: #fff;
    }
    .btn {
      display: block; width: 100%;
      padding: 14px 24px;
      background: #fff; color: #000;
      text-decoration: none;
      border-radius: 14px;
      font-size: 15px; font-weight: 600;
      border: none; cursor: pointer;
      transition: opacity 0.15s;
    }
    .btn:active { opacity: 0.8; }
    .btn-secondary {
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.6);
      margin-top: 10px;
      font-size: 13px;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .waiting-msg {
      font-size: 14px; color: rgba(255,255,255,0.4);
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Default: spinner -->
    <div id="loading">
      <div class="spinner"></div>
      <p class="waiting-msg">Opening...</p>
    </div>

    <!-- iOS prompt -->
    <div class="ios-msg" id="iosPrompt">
      <h2>Open in Safari</h2>
      <p>Instagram's browser blocks external links.<br>Tap the menu below to continue:</p>
      <div class="arrow-hint">
        <span class="dots-icon">···</span>
        <span>→ Open in Safari</span>
      </div>
      <a href="${escapedUrl}" class="btn" target="_blank" rel="noopener noreferrer">
        Or tap here to try anyway
      </a>
      <button class="btn btn-secondary" onclick="copyLink()">Copy link</button>
      <p id="copyFeedback" style="font-size:12px; color:rgba(255,255,255,0.3); margin-top:8px; min-height:18px;"></p>
    </div>
  </div>

  <script>
    var url = ${JSON.stringify(url)};
    var ua = navigator.userAgent || '';
    var isAndroid = /Android/i.test(ua);
    var isIOS = /iPhone|iPad|iPod/i.test(ua);
    var isInApp = /Instagram|FBAN|FBAV/i.test(ua);

    function copyLink() {
      navigator.clipboard.writeText(url).then(function() {
        document.getElementById('copyFeedback').textContent = 'Link copied!';
      }).catch(function() {
        document.getElementById('copyFeedback').textContent = 'Could not copy';
      });
    }

    if (isAndroid && isInApp) {
      // Android: intent scheme reliably opens system browser
      var intent = 'intent://' + url.replace(/^https?:\\/\\//, '') +
        '#Intent;scheme=https;package=com.android.chrome;action=android.intent.action.VIEW;end';
      window.location.href = intent;
      // Fallback if Chrome isn't installed
      setTimeout(function() {
        var genericIntent = 'intent://' + url.replace(/^https?:\\/\\//, '') +
          '#Intent;scheme=https;action=android.intent.action.VIEW;end';
        window.location.href = genericIntent;
      }, 500);
    } else if (isIOS && isInApp) {
      // iOS: Cannot escape IG browser — show instructions
      document.getElementById('loading').style.display = 'none';
      document.getElementById('iosPrompt').style.display = 'block';
    } else {
      // Not in-app, just redirect
      window.location.href = url;
    }
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
