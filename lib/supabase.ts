import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side supabase (for use in client components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side supabase — bypasses Next.js fetch cache so data is always fresh
export function createServerSupabaseClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false },
    global: {
      fetch: (url: any, options: any) => fetch(url, { ...options, cache: 'no-store' }),
    },
  })
}

// Types matching our DB schema

export interface Creator {
  id: string
  slug: string
  display_name: string
  username: string
  bio?: string
  avatar_url?: string
  of_handle?: string | null
  is_active: boolean
  created_at: string
}

export interface SocialAccount {
  id: string
  creator_id: string
  platform: 'instagram' | 'tiktok'
  username: string
  is_active: boolean
  created_at: string
}

export interface SocialSnapshot {
  id: string
  social_account_id: string
  scraped_at: string
  followers?: number
  following?: number
  post_count?: number
  total_views?: number
  total_likes?: number
  total_comments?: number
  raw_data?: Record<string, unknown>
}

export interface SocialPost {
  id: string
  social_account_id: string
  post_short_code: string
  post_type?: string
  caption?: string
  display_url?: string
  post_timestamp?: string
  video_view_count: number
  likes_count: number
  comments_count: number
  first_seen_at: string
  last_seen_at: string
}

// ── Conversion tracking ─────────────────────────────────────────────────────
// The creator IS the OF account every IG link funnels into, so subscribers are
// counted per creator. Traffic is counted per tracking link.

export interface CreatorDaily {
  id: string
  creator_id: string
  date: string
  new_subs: number
  note?: string | null
  created_at: string
  updated_at: string
}

export interface CreatorExpectation {
  id: string
  creator_id: string
  daily_sub_target: number
  created_at: string
  updated_at: string
}

export interface TrackingLink {
  id: string
  creator_id: string
  social_account_id?: string | null
  label: string
  url?: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LinkDaily {
  id: string
  tracking_link_id: string
  date: string
  views: number
  profile_views: number
  link_clicks: number
  created_at: string
  updated_at: string
}
