'use client'

import { useState, useEffect } from 'react'

interface Link {
  id: string
  title: string
  url: string
  icon: string
  thumbnail_url?: string
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
  button_style?: string // 'rounded' | 'pill' | 'sharp'
  button_color?: string
  text_color?: string
}

interface Props {
  creator: Creator
  links: Link[]
}

// Platform icon SVGs
const PLATFORM_ICONS: Record<string, { label: string; color: string; svg: string }> = {
  onlyfans: {
    label: 'OnlyFans',
    color: '#00AFF0',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.5c4.142 0 7.5 3.358 7.5 7.5s-3.358 7.5-7.5 7.5S4.5 16.142 4.5 12 7.858 4.5 12 4.5zm0 2.25c-2.9 0-5.25 2.35-5.25 5.25S9.1 17.25 12 17.25 17.25 14.9 17.25 12 14.9 6.75 12 6.75zm0 2.25c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3z"/></svg>`,
  },
  fansly: {
    label: 'Fansly',
    color: '#1DA1F2',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>`,
  },
  instagram: {
    label: 'Instagram',
    color: '#E1306C',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
  },
  twitter: {
    label: 'X / Twitter',
    color: '#ffffff',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  },
  tiktok: {
    label: 'TikTok',
    color: '#ff0050',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.83 4.83 0 01-1.01-.07z"/></svg>`,
  },
  link: {
    label: 'Link',
    color: '#888888',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  },
}

function getPlatform(icon: string) {
  return PLATFORM_ICONS[icon?.toLowerCase()] || PLATFORM_ICONS.link
}

export default function CreatorPage({ creator, links }: Props) {
  // Track page view on mount
  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creator_id: creator.id, link_id: null, type: 'page_view' }),
    }).catch(() => {})
  }, [creator.id])

  const bgStyle = creator.background_image_url
    ? {
        backgroundImage: `url(${creator.background_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { backgroundColor: creator.background_color || '#080808' }

  const buttonRadius =
    creator.button_style === 'pill'
      ? 'rounded-full'
      : creator.button_style === 'sharp'
      ? 'rounded-none'
      : 'rounded-xl'

  function handleLinkClick(link: Link) {
    // Fire analytics non-blocking
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creator_id: creator.id,
        link_id: link.id,
        type: 'link_click',
      }),
    }).catch(() => {})
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen flex flex-col items-center relative" style={bgStyle}>
      {/* Dark overlay when background image is set */}
      {creator.background_image_url && (
        <div className="fixed inset-0 bg-black/60 z-0 pointer-events-none" />
      )}

      <div className="relative z-10 w-full max-w-[420px] mx-auto px-4 py-12 flex flex-col items-center gap-5">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 bg-[#1a1a1a] flex-shrink-0">
          {creator.avatar_url ? (
            <img src={creator.avatar_url} alt={creator.display_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white/30">
              {creator.display_name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Name + verified */}
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-semibold text-white">{creator.display_name}</h1>
            {creator.show_verified && (
              <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            )}
          </div>
          <p className="text-sm text-white/40">@{creator.username || creator.slug}</p>
          {creator.bio && (
            <p className="text-sm text-white/65 mt-1 leading-relaxed max-w-xs">{creator.bio}</p>
          )}
        </div>

        {/* Link buttons */}
        <div className="w-full flex flex-col gap-3 mt-1">
          {links.map((link) => {
            const platform = getPlatform(link.icon)
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link)}
                className={`w-full ${buttonRadius} overflow-hidden transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] active:opacity-80`}
                style={{ backgroundColor: creator.button_color || '#1a1a1a' }}
              >
                {/* Optional thumbnail image */}
                {link.thumbnail_url && (
                  <div className="w-full h-44 overflow-hidden">
                    <img
                      src={link.thumbnail_url}
                      alt={link.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: platform.color }}
                    dangerouslySetInnerHTML={{ __html: platform.svg }}
                  />
                  <span
                    className="flex-1 text-left text-sm font-medium"
                    style={{ color: creator.text_color || '#ffffff' }}
                  >
                    {link.title}
                  </span>
                  <svg className="w-4 h-4 text-white/25 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </button>
            )
          })}
        </div>

        <p className="text-xs text-white/15 mt-4">Powered by LinkMe</p>
      </div>
    </div>
  )
}
