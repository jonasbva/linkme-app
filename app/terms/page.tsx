'use client'

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 640, padding: '48px 20px 80px' }}>
        <button onClick={() => window.history.back()} style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Back</button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 16, marginBottom: 32 }}>Terms of Service</h1>

        <div style={{ fontSize: 14, lineHeight: 1.8, color: 'rgba(255,255,255,0.55)' }}>
          <p style={{ marginBottom: 20 }}>Last updated: March 2026</p>

          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 8, marginTop: 32 }}>1. Acceptance of Terms</h2>
          <p style={{ marginBottom: 16 }}>
            By accessing or using this platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
          </p>

          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 8, marginTop: 32 }}>2. Description of Service</h2>
          <p style={{ marginBottom: 16 }}>
            This platform provides a link-in-bio service that allows creators to share multiple links through a single, customizable page. The service includes page hosting, analytics, and custom domain support.
          </p>

          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 8, marginTop: 32 }}>3. User Conduct</h2>
          <p style={{ marginBottom: 16 }}>
            You agree not to use this service for any unlawful purpose or in violation of any applicable laws. You must not upload content that is illegal, harmful, threatening, abusive, defamatory, or otherwise objectionable. We reserve the right to remove any content or disable any page at our sole discretion.
          </p>

          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 8, marginTop: 32 }}>4. Content Ownership</h2>
          <p style={{ marginBottom: 16 }}>
            Creators retain ownership of all content they upload to the platform. By using the service, you grant us a limited, non-exclusive license to host and display your content as part of providing the service.
          </p>

          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 8, marginTop: 32 }}>5. Third-Party Links</h2>
          <p style={{ marginBottom: 16 }}>
            Creator pages may contain links to third-party websites. We are not responsible for the content, privacy practices, or availability of any linked third-party sites. Clicking on external links is at your own risk.
          </p>

          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 8, marginTop: 32 }}>6. Limitation of Liability</h2>
          <p style={{ marginBottom: 16 }}>
            The service is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the service.
          </p>

          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 8, marginTop: 32 }}>7. Termination</h2>
          <p style={{ marginBottom: 16 }}>
            We reserve the right to suspend or terminate any creator page or account at any time, with or without notice, for conduct that we believe violates these Terms of Service or is harmful to other users or the platform.
          </p>

          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 8, marginTop: 32 }}>8. Changes to Terms</h2>
          <p style={{ marginBottom: 16 }}>
            We may update these Terms of Service from time to time. Continued use of the service after any changes constitutes acceptance of the new terms.
          </p>

          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 8, marginTop: 32 }}>9. Contact</h2>
          <p style={{ marginBottom: 16 }}>
            If you have questions about these Terms of Service, please contact us at legal@linkme.app.
          </p>
        </div>
      </div>
    </div>
  )
}
