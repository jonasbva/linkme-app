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
  background_color?: string
  background_image_url?: string
  custom_domain?: string
  button_style?: string
  button_color?: string
  text_color?: string
  show_verified?: boolean
  avatar_position?: string
  hero_height?: string
  is_active: boolean
  created_at: string
}

export interface Link {
  id: string
  creator_id: string
  title: string
  url: string
  icon: string
  thumbnail_url?: string
  thumbnail_position?: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface Click {
  id: string
  creator_id: string
  link_id?: string
  type: 'page_view' | 'link_click'
  country?: string
  country_code?: string
  city?: string
  device?: string
  referrer?: string
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

export interface ConversionExpectation {
  id: string
  creator_id: string
  daily_sub_target: number
  created_at: string
  updated_at: string
}

export interface ConversionDaily {
  id: string
  creator_id: string
  date: string
  views: number
  profile_views: number
  link_clicks: number
  new_subs: number
  created_at: string
  updated_at: string
}
