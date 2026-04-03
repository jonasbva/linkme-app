'use client'

import { useEffect, useState, useRef } from 'react'

interface Link {
  id: string
  title: string
  url: string
  icon: string
  custom_icon_url?: string
  thumbnail_url?: string
  thumbnail_position?: string  // 0-100 percentage (0=top, 50=center, 100=bottom)
  thumbnail_height?: number    // display height in pixels (100-400)
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
  hero_position?: string     // percentage (0-100)
  hero_scale?: string        // percentage (0-200)
  link_font_size?: number    // font size for link titles (10-22)
  link_text_align?: string   // 'left' | 'center'
  link_icon_style?: string   // 'inline' | 'large'
  show_footer?: boolean      // show privacy/terms/report footer
}

interface Props {
  creator: Creator
  links: Link[]
}

const PLATFORM_ICONS: Record<string, { color: string; svg: string }> = {
  onlyfans: {
    color: '#00AFF0',
    svg: `<img src="https://sogytagzrkfuvwrqzqgk.supabase.co/storage/v1/object/public/creators/Logos/OFIconBlue.svg" width="100%" height="100%" style="object-fit:contain" />`,
  },
  fansly: {
    color: '#1DA1F2',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>`,
  },
  instagram: {
    color: '#E1306C',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
  },
  twitter: {
    color: '#ffffff',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  },
  tiktok: {
    color: '#ff0050',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.83 4.83 0 01-1.01-.07z"/></svg>`,
  },
  snapchat: {
    color: '#FFFC00',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 100 16 8 8 0 000-16zm3 6a1 1 0 110 2 1 1 0 010-2zm-6 0a1 1 0 110 2 1 1 0 010-2z"/></svg>`,
  },
  youtube: {
    color: '#FF0000',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>`,
  },
  reddit: {
    color: '#FF4500',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm5 10.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM8.5 14c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3zm6.5-6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/></svg>`,
  },
  twitch: {
    color: '#9146FF',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M12 2L9 6H5V18H10V22L14 18H17L22 12V2H12ZM14 13L12 15H9L7 17V15H4V5H14V13Z"/></svg>`,
  },
  telegram: {
    color: '#0088cc',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.43-1.13 7.1-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.59-1.38-.95-2.23-1.52-.99-.66-.35-1.02.21-1.61.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.06-.16-.04-.25-.02-.11.02-1.93 1.23-5.45 3.6-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.44-.41-1.39-.87.03-.24.35-.48.95-.72 3.7-1.6 6.17-2.66 7.41-3.23 3.52-1.5 4.25-1.76 4.73-1.77.1 0 .34.03.49.15.12.09.15.22.17.37z"/></svg>`,
  },
  discord: {
    color: '#5865F2',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M20.317 4.492c-1.53-.742-3.247-1.139-5.085-1.139a.06.06 0 00-.028.006l-.26.49a18.27 18.27 0 014.939 2.495.059.059 0 01.03.052c-3.296-1.688-6.6-1.688-9.764 0a.06.06 0 01.026-.05A18.27 18.27 0 018.971 6.35l-.26-.49a.06.06 0 00-.028-.006c-1.838 0-3.554.397-5.085 1.14a.06.06 0 00-.03.062c.314.961.524 1.466.524 1.466 3.296 5.035 8.191 6.289 13.13 1.3a.06.06 0 00.03-.055s.21-.505.524-1.466a.06.06 0 00-.03-.062zM8.68 13.364c-.56 0-1.02-.504-1.02-1.122s.46-1.122 1.02-1.122c.56 0 1.02.504 1.02 1.122 0 .618-.46 1.122-1.02 1.122zm6.64 0c-.56 0-1.02-.504-1.02-1.122s.46-1.122 1.02-1.122c.56 0 1.02.504 1.02 1.122 0 .618-.46 1.122-1.02 1.122z"/></svg>`,
  },
  spotify: {
    color: '#1DB954',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>`,
  },
  link: {
    color: '#888',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="100%" height="100%"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  },
}

function getPlatform(icon: string) {
  return PLATFORM_ICONS[icon?.toLowerCase()] || PLATFORM_ICONS.link
}

export default function CreatorPage({ creator, links }: Props) {
  const [showBar, setShowBar] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creator_id: creator.id, link_id: null, type: 'page_view' }),
    }).catch(() => {})
  }, [creator.id])

  useEffect(() => {
    if (!heroRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowBar(!entry.isIntersecting)
      },
      { threshold: 0 }
    )

    observer.observe(heroRef.current)
    return () => observer.disconnect()
  }, [])

  const buttonRadius =
    creator.button_style === 'pill' ? 'rounded-full' :
    creator.button_style === 'sharp' ? 'rounded-none' : 'rounded-2xl'

  function isInAppBrowser() {
    if (typeof navigator === 'undefined') return false
    const ua = navigator.userAgent || ''
    return /Instagram|FBAN|FBAV|Twitter|Line\//i.test(ua)
  }

  function handleLinkClick(link: Link) {
    // Use sendBeacon so the request survives page navigation
    const payload = JSON.stringify({ creator_id: creator.id, link_id: link.id, type: 'link_click' })
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }))
    } else {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {})
    }

    if (isInAppBrowser()) {
      window.location.href = `/api/redirect?url=${encodeURIComponent(link.url)}`
    } else {
      window.open(link.url, '_blank', 'noopener,noreferrer')
    }
  }

  const bg = creator.background_color || '#080808'
  const heroPositionPercent = parseInt(creator.hero_position || '30') || 30
  const heroScalePercent = parseInt(creator.hero_scale || '100') || 100
  const heroScaleValue = heroScalePercent / 100
  const linkFontSize = creator.link_font_size || 14
  const linkTextAlign = creator.link_text_align || 'left'
  const linkIconStyle = creator.link_icon_style || 'inline'

  function renderLinkIcon(link: Link, size: number = 20) {
    if (link.custom_icon_url) {
      return (
        <img
          src={link.custom_icon_url}
          alt={link.title}
          style={{ width: size, height: size, borderRadius: size > 24 ? 8 : 4, objectFit: 'cover' }}
        />
      )
    }
    const platform = getPlatform(link.icon)
    return (
      <div style={{ color: platform.color, width: size, height: size, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: platform.svg }} />
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', justifyContent: 'center' }}>
      {/* Sticky top bar — slides in when hero scrolls out of view */}
      {creator.avatar_url && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          display: 'flex', justifyContent: 'center',
          pointerEvents: showBar ? 'auto' : 'none',
          transform: showBar ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease-out',
          opacity: showBar ? 1 : 0,
        }}>
          <div style={{
            width: '100%', maxWidth: 500,
            height: 56, display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 16, paddingRight: 16,
            background: `${bg}e6`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <img
              src={creator.avatar_url}
              alt={creator.display_name}
              style={{
                width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {creator.display_name}
              </span>
              {creator.show_verified && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#a78bfa" style={{ flexShrink: 0 }}>
                  <path d="M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/><path d="M8 12.5l3 3 5.5-5.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              )}
            </div>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 500, flexShrink: 0 }}>
              @{creator.username || creator.slug}
            </span>
          </div>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* ── Hero image (full width, fades to bg at bottom) ── */}
        {creator.avatar_url ? (
          <div
            ref={heroRef}
            style={{
              width: '100%', position: 'relative', aspectRatio: '3/4',
              maxHeight: creator.hero_height === 'small' ? '45vh' : creator.hero_height === 'medium' ? '60vh' : '72vh',
              overflow: 'hidden'
            }}
          >
            <img
              src={creator.avatar_url}
              alt={creator.display_name}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                objectPosition: `center ${heroPositionPercent}%`,
                display: 'block',
                transform: `scale(${heroScaleValue})`,
                transformOrigin: 'center center',
                transition: 'transform 0.3s ease-out'
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
                    <path d="M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/><path d="M8 12.5l3 3 5.5-5.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
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
                  <path d="M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/><path d="M8 12.5l3 3 5.5-5.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>@{creator.username || creator.slug}</p>
          </div>
        )}

        {/* ── Below hero ── */}
        <div style={{ width: '100%', padding: '8px 16px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>

          {/* Lock / badge icon */}
          {(() => {
            const lockIcon = creator.lock_icon_url ? (
              <img src={creator.lock_icon_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="23" fill="#00AFF0" stroke="#00AFF0" strokeWidth="2"/>
                <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2"/>
                <rect x="16" y="22" width="16" height="12" rx="2.5" fill="#fff"/>
                <path d="M19 22v-4a5 5 0 0 1 10 0v4" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <circle cx="24" cy="28" r="1.5" fill="#00AFF0"/>
              </svg>
            )
            return creator.lock_link_url ? (
              <a href={creator.lock_link_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: 40, height: 40 }}>
                {lockIcon}
              </a>
            ) : (
              <div style={{ width: 40, height: 40 }}>
                {lockIcon}
              </div>
            )
          })()}

          {creator.bio && (
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 1.5, margin: 0, maxWidth: 320 }}>
              {creator.bio}
            </p>
          )}

          {/* Links */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {links.map((link) => {
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
                  {link.thumbnail_url ? (
                    <div style={{ width: '100%', height: link.thumbnail_height || 200, overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={link.thumbnail_url}
                        alt={link.title}
                        style={{
                          width: '100%', height: '100%', objectFit: 'cover',
                          objectPosition: `center ${parseInt(link.thumbnail_position || '50') || 50}%`,
                          display: 'block'
                        }}
                      />
                      {/* Large icon top-left */}
                      {linkIconStyle === 'large' && (
                        <div style={{ position: 'absolute', top: 12, left: 14 }}>
                          {renderLinkIcon(link, 36)}
                        </div>
                      )}
                      {/* Title overlay on thumbnail */}
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        padding: '32px 16px 14px',
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.82))',
                        display: 'flex', alignItems: linkTextAlign === 'center' ? 'center' : 'center',
                        justifyContent: linkTextAlign === 'center' ? 'center' : 'flex-start',
                        gap: 10,
                      }}>
                        {linkIconStyle === 'inline' && renderLinkIcon(link)}
                        <span style={{ flex: linkTextAlign === 'center' ? undefined : 1, fontSize: linkFontSize, fontWeight: 700, color: '#fff', textAlign: linkTextAlign as any }}>{link.title}</span>
                        {linkTextAlign !== 'center' && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" style={{ flexShrink: 0 }}>
                            <path d="M9 18l6-6-6-6"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* No thumbnail — show title in a normal row */
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                      justifyContent: linkTextAlign === 'center' ? 'center' : 'flex-start',
                    }}>
                      {linkIconStyle === 'inline' && renderLinkIcon(link)}
                      <span style={{
                        flex: linkTextAlign === 'center' ? undefined : 1,
                        fontSize: Math.max(linkFontSize - 1, 10), fontWeight: 500,
                        color: creator.text_color || '#fff',
                        textAlign: linkTextAlign as any,
                      }}>{link.title}</span>
                      {linkTextAlign !== 'center' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" style={{ flexShrink: 0 }}>
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Footer */}
          {creator.show_footer !== false && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, paddingTop: 24 }}>
              <a href="/privacy" style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>Privacy Policy</a>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.1)' }}>|</span>
              <a href="/terms" style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>Terms</a>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.1)' }}>|</span>
              <a href="/report" style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>Report</a>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
