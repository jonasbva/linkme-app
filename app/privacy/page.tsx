'use client'

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 640, padding: '48px 20px 80px' }}>
        <button onClick={() => window.history.back()} style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Back</button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 16, marginBottom: 32 }}>Privacy Policy</h1>

        <div style={{ fontSize: 14, lineHeight: 1.8, color: 'rgba(255,255,255,0.55)' }}>
          <p style={{ marginBottom: 20 }}>Last updated: March 2026</p>

          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 8, marginTop: 32 }}>1. Information We Collect</h2>
          <p style={{ marginBottom: 16 }}>
            When you visit a creator page hosted on our platform, we may collect certain information automatically, including your IP address, browser type, device type, approximate geographic location (country-level), and the pages or links you interact with. This data is collected to provide analytics to creators and to improve our service.
          </p>

          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 8, marginTop: 32 }}>2. How We Use Your Information</h2>
          <p style={{ marginBottom: 16 }}>
            We use the collected information to: provide aggregated analytics to creators (page views, click counts, geographic distribution); improve and optimize the platform; detect and prevent abuse or fraudulent activity; and comply with legal obligations.
          </p>

          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 8, marginTop: 32 }}>3. Cookies and Tracking</h2>
          <p style={{ marginBottom: 16 }}>
            We use minimal, functional cookies required for the platform to operate. We do not use third-party advertising trackers. Analytics data is collected server-side without persistent tracking cookies.
          </p>

          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 8, marginTop: 32 }}>4. Data Sharing</h2>
          <p style={{ marginBottom: 16 }}>
            We do not sell your personal information. Aggregated, non-identifiable analytics data (such as total page views and click counts) is shared with creators. We may share information if required by law or to protect our legal rights.
          </p>

          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 8, marginTop: 32 }}>5. Data Retention</h2>
          <p style={{ marginBottom: 16 }}>
            Analytics data is retained for as long as the creator account is active. If a creator account is deleted, associated analytics data will be removed within 30 days.
          </p>

          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 8, marginTop: 32 }}>6. Your Rights</h2>
          <p style={{ marginBottom: 16 }}>
            Depending on your jurisdiction, you may have the right to access, correct, or delete your personal data. To exercise these rights, please contact us using the information below.
          </p>

          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 8, marginTop: 32 }}>7. Contact</h2>
          <p style={{ marginBottom: 16 }}>
            If you have questions about this Privacy Policy, please contact us at privacy@linkme.app.
          </p>
        </div>
      </div>
    </div>
  )
}
