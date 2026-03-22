'use client'

import { useState } from 'react'

export default function ReportPage() {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [url, setUrl] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // In production, this would send to an API endpoint
    setSubmitted(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 640, padding: '48px 20px 80px' }}>
        <a href="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>← Back</a>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 16, marginBottom: 8 }}>Report Content</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 32, lineHeight: 1.6 }}>
          If you believe content on this page violates our terms of service or is harmful, please let us know.
        </p>

        {submitted ? (
          <div style={{
            padding: 24,
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            borderRadius: 12,
          }}>
            <p style={{ fontSize: 14, color: 'rgba(16, 185, 129, 0.8)', fontWeight: 600, marginBottom: 4 }}>
              Report submitted
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
              Thank you for your report. We will review the content and take appropriate action.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 6 }}>Page URL</label>
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://..."
                required
                style={{
                  width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
                  fontSize: 13, color: 'rgba(255,255,255,0.8)', outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 6 }}>Reason</label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                required
                style={{
                  width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
                  fontSize: 13, color: 'rgba(255,255,255,0.8)', outline: 'none',
                }}
              >
                <option value="">Select a reason</option>
                <option value="illegal">Illegal content</option>
                <option value="harassment">Harassment or bullying</option>
                <option value="impersonation">Impersonation</option>
                <option value="scam">Scam or fraud</option>
                <option value="underage">Involves a minor</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 6 }}>Details</label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Please describe the issue..."
                rows={4}
                required
                style={{
                  width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
                  fontSize: 13, color: 'rgba(255,255,255,0.8)', outline: 'none',
                  resize: 'vertical', lineHeight: 1.5,
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '10px 20px', background: '#fff', color: '#000',
                fontSize: 13, fontWeight: 600, borderRadius: 10, border: 'none',
                cursor: 'pointer', alignSelf: 'flex-start',
              }}
            >
              Submit report
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
