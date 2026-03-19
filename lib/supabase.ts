import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side supabase (for use in client components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side supabase for admin API routes — uses service role key to bypass RLS
export function createServerSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })
  }
  // Fallback to anon key if service role key not set
  return createClient(supabaseUrl, supabaseAnonKey)
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
