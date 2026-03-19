'use client'

import { useEffect } from 'react'

interface Link {
  id: string
  title: string
  url: string
  icon: string
  thumbnail_url?: string
  thumbnail_position?: string  // 'top' | 'center' | 'bottom'
  sort_order: number
  is_active: boolean
}

interface Creator {
  id: string
  slug: string
  display_name: string
  username: string
  bio?: string
  avatar_url?: string
  background_color?: string
  background_image_url?: string
  show_verified?: boolean
  button_style?: string
  button_color?: string
  text_color?: string
  avatar_position?: string   // 'top' | 'center' | 'bottom'
  hero_height?: string       // 'small' | 'medium' | 'large'
}

interface Props {
  creator: Creator
  links: Link[]
}

const PLATFORM_ICONS: Record<string, { color: string; svg: string }> = {
  onlyfans: {
    color: '#00AFF0',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.5c4.142 0 7.5 3.358 7.5 7.5s-3.358 7.5-7.5 7.5S4.5 16.142 4.5 12 7.858 4.5 12 4.5zm0 2.25c-2.9 0-5.25 2.35-5.25 5.25S9.1 17.25 12 17.25 17.25 14.9 17.25 12 14.9 6.75 12 6.75zm0 2.25c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3z"/></svg>`,
  },
  fansly: {
    color: '#1DA1F2',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>`,
  },
  instagram: {
    color: '#E1306C',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
  },
  twitter: {
    color: '#ffffff',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  },
  tiktok: {
    color: '#ff0050',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.83 4.83 0 01-1.01-.07z"/></svg>`,
  },
  link: {
    color: '#888',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  },
}

function getPlatform(icon: string) {
  return PLATFORM_ICONS[icon?.toLowerCase()] || PLATFORM_ICONS.link
}

export default function CreatorPage({ creator, links }: Props) {
  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creator_id: creator.id, link_id: null, type: 'page_view' }),
    }).catch(() => {})
  }, [creator.id])

  const buttonRadius =
    creator.button_style === 'pill' ? 'rounded-full' :
    creator.button_style === 'sharp' ? 'rounded-none' : 'rounded-2xl'

  function handleLinkClick(link: Link) {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creator_id: creator.id, link_id: link.id, type: 'link_click' }),
    }).catch(() => {})
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }

  const bg = creator.background_color || '#080808'

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* ── Hero image (full width, fades to bg at bottom) ── */}
        {creator.avatar_url ? (
          <div style={{
            width: '100%', position: 'relative', aspectRatio: '3/4',
            maxHeight: creator.hero_height === 'small' ? '45vh' : creator.hero_height === 'medium' ? '60vh' : '72vh',
            overflow: 'hidden'
          }}>
            <img
              src={creator.avatar_url}
              alt={creator.display_name}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                objectPosition: creator.avatar_position || 'top',
                display: 'block'
              }}
            />
            {/* Gradient overlay fading to background color */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.5) 60%, ${bg}f5 85%, ${bg} 100%)`
            }} />
            {/* Name overlaid at bottom of image */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', textShadow: '0 1px 8px rgba(0,0,0,0.4)', margin: 0 }}>
                  {creator.display_name}
                </h1>
                {creator.show_verified && (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#a78bfa" style={{ flexShrink: 0 }}>
                    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>
                )}
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0 }}>@{creator.username || creator.slug}</p>
            </div>
          </div>
        ) : (
          /* Fallback: no image — show name normally */
          <div style={{ padding: '48px 20px 8px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>{creator.display_name}</h1>
              {creator.show_verified && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#a78bfa">
                  <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                </svg>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>@{creator.username || creator.slug}</p>
          </div>
        )}

        {/* ── Below hero ── */}
        <div style={{ width: '100%', padding: '16px 16px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>

          {/* Lock icon */}
          <div style={{ width: 42, height: 42, background: '#1a1a1a', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          {creator.bio && (
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 1.5, margin: 0, maxWidth: 320 }}>
              {creator.bio}
            </p>
          )}

          {/* Links */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {links.map((link) => {
              const platform = getPlatform(link.icon)
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link)}
                  style={{
                    width: '100%', borderRadius: buttonRadius === 'rounded-2xl' ? 14 : buttonRadius === 'rounded-full' ? 999 : 0,
                    overflow: 'hidden', background: creator.button_color || '#141414',
                    border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', textAlign: 'left',
                    transition: 'transform 0.15s', padding: 0,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.015)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.985)')}
                  onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {link.thumbnail_url && (
                    <div style={{ width: '100%', height: 200, overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={link.thumbnail_url}
                        alt={link.title}
                        style={{
                          width: '100%', height: '100%', objectFit: 'cover',
                          objectPosition: link.thumbnail_position || 'center',
                          display: 'block'
                        }}
                      />
                      {/* Title overlay on thumbnail — no duplicate below */}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 16px 14px', background: 'linear-gradient(transparent, rgba(0,0,0,0.82))', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ color: platform.color, width: 18, height: 18, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: platform.svg }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{link.title}</span>
                      </div>
                    </div>
                  )}
                  {/* Bottom row: only show title here if there is NO thumbnail */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px' }}>
                    <div style={{ color: platform.color, width: 20, height: 20, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: platform.svg }} />
                    {!link.thumbnail_url && (
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: creator.text_color || '#fff' }}>{link.title}</span>
                    )}
                    {link.thumbnail_url && <span style={{ flex: 1 }} />}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </button>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}
