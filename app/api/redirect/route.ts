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
    .ios-msg .safari-cta {
      background: rgba(0,122,255,0.12);
      border: 1.5px solid rgba(0,122,255,0.4);
      border-radius: 16px;
      padding: 18px 20px;
      margin-bottom: 24px;
      text-align: center;
    }
    .ios-msg .cta-arrow {
      font-size: 24px;
      color: #007AFF;
      margin-bottom: 8px;
      animation: bounce 1.5s ease infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(6px); }
    }
    .ios-msg .cta-text {
      font-size: 14px;
      color: rgba(255,255,255,0.7);
      line-height: 1.6;
    }
    .ios-msg .cta-text strong {
      color: #007AFF;
      font-weight: 600;
    }
    .ios-msg .dots-icon {
      font-size: 18px; letter-spacing: 1px; font-weight: 700;
      color: #fff;
      background: rgba(255,255,255,0.12);
      border-radius: 6px;
      padding: 1px 6px;
      font-family: monospace;
    }
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
      <div class="safari-cta">
        <div class="cta-arrow">↓</div>
        <div class="cta-text">Tap <span class="dots-icon">···</span> at the top right, then <strong>"Open in Safari"</strong></div>
      </div>
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
