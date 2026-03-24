-- ============================================================
-- AUTH, ROLES & PERMISSIONS SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. ADMIN USERS — email/password login
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  is_super_admin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ROLES — named groups of permissions (like "Feedposts/Stories", "G1 - Chatter")
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  grant_all_creators BOOLEAN DEFAULT false,
  all_creators_permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. USER ↔ ROLE mapping (many-to-many: a user can have multiple roles)
CREATE TABLE IF NOT EXISTS admin_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  UNIQUE(user_id, role_id)
);

-- 4. PERMISSIONS — per-creator access, assignable to users OR roles
-- permission_type: 'view_links', 'view_social', 'view_conversions', 'edit_settings', 'edit_links', 'input_conversions', 'edit_social'
-- Either user_id or role_id is set (not both)
CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES admin_roles(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT user_or_role CHECK (
    (user_id IS NOT NULL AND role_id IS NULL) OR 
    (user_id IS NULL AND role_id IS NOT NULL)
  ),
  UNIQUE(user_id, creator_id, permission_type),
  UNIQUE(role_id, creator_id, permission_type)
);

-- Index for fast permission lookups
CREATE INDEX IF NOT EXISTS idx_permissions_user ON admin_permissions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_permissions_role ON admin_permissions(role_id) WHERE role_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_permissions_creator ON admin_permissions(creator_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON admin_user_roles(user_id);

-- 5. CREATOR VISIBILITY — which creators a user/role can see
-- If no rows exist for a user, they see nothing (unless super_admin)
CREATE TABLE IF NOT EXISTS admin_creator_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES admin_roles(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  CONSTRAINT access_user_or_role CHECK (
    (user_id IS NOT NULL AND role_id IS NULL) OR 
    (user_id IS NULL AND role_id IS NOT NULL)
  ),
  UNIQUE(user_id, creator_id),
  UNIQUE(role_id, creator_id)
);

CREATE INDEX IF NOT EXISTS idx_creator_access_user ON admin_creator_access(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_creator_access_role ON admin_creator_access(role_id) WHERE role_id IS NOT NULL;

-- RLS policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_creator_access ENABLE ROW LEVEL SECURITY;

-- Full access (service role bypasses anyway)
DO $$ BEGIN
  CREATE POLICY "admin_users_all" ON admin_users FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin_roles_all" ON admin_roles FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin_user_roles_all" ON admin_user_roles FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin_permissions_all" ON admin_permissions FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin_creator_access_all" ON admin_creator_access FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 6. Seed the first super admin (Jonas)
INSERT INTO admin_users (email, password_hash, display_name, is_super_admin)
VALUES (
  'jonasboeseva@gmail.com',
  '6ae3d69dd1e69b67fba9d901d4967755:edfc3db1273a9782b0ab49bd25300f673f4a16ba516985097840765b29e83628',
  'Jonas',
  true
)
ON CONFLICT (email) DO UPDATE SET
  is_super_admin = true,
  password_hash = EXCLUDED.password_hash;
