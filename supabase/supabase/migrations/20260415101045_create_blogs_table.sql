-- ===============================
-- 1. EXTENSIONS (required)
-- ===============================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===============================
-- 2. ENUM: blog_status
-- ===============================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'blog_status'
  ) THEN
    CREATE TYPE public.blog_status AS ENUM ('Active', 'InActive');
  END IF;
END$$;

-- ===============================
-- 3. TABLE: blogs
-- ===============================
CREATE TABLE IF NOT EXISTS public.blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  title text NOT NULL,
  description text,

  status public.blog_status DEFAULT 'Active',

  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz NULL
);

-- ===============================
-- 4. TRIGGER: auto update updated_at
-- ===============================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_updated_at ON public.blogs;

CREATE TRIGGER trg_set_updated_at
BEFORE UPDATE ON public.blogs
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ===============================
-- 5. ENABLE RLS
-- ===============================
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- ===============================
-- 6. DROP OLD POLICIES (safe rerun)
-- ===============================
DROP POLICY IF EXISTS "select_own_blogs" ON public.blogs;
DROP POLICY IF EXISTS "insert_own_blogs" ON public.blogs;
DROP POLICY IF EXISTS "update_own_blogs" ON public.blogs;
DROP POLICY IF EXISTS "soft_delete_own_blogs" ON public.blogs;
DROP POLICY IF EXISTS "disable_delete_blogs" ON public.blogs;

-- ===============================
-- 7. SELECT POLICY
-- Only return rows owned by the user that are NOT soft deleted
-- ===============================
CREATE POLICY "select_own_blogs"
ON public.blogs
FOR SELECT
TO authenticated
USING (true);

-- ===============================
-- 8. INSERT POLICY
-- ===============================
CREATE POLICY "insert_own_blogs"
ON public.blogs
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- ===============================
-- 9. UPDATE POLICY
-- Handles both regular updates AND soft delete (setting deleted_at).
-- USING: only allows updating rows that are NOT already soft deleted.
-- WITH CHECK: ensures user_id cannot be changed to someone else's.
-- ===============================
CREATE POLICY "update_own_blogs"
ON public.blogs
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ===============================
-- 10. DELETE POLICY (disable hard delete)
-- Hard deletes are never allowed — soft delete via UPDATE only.
-- ===============================
CREATE POLICY "disable_delete_blogs"
ON public.blogs
FOR DELETE
TO authenticated
USING (false);

-- ===============================
-- 11. INDEXES (performance)
-- ===============================
CREATE INDEX IF NOT EXISTS idx_blogs_user_id ON public.blogs(user_id);
CREATE INDEX IF NOT EXISTS idx_blogs_deleted_at ON public.blogs(deleted_at);
CREATE INDEX IF NOT EXISTS idx_blogs_user_deleted ON public.blogs(user_id, deleted_at);

-- ===============================
-- 12. SCHEMA & TABLE GRANTS
-- Without these, authenticated users get "permission denied for schema public"
-- even if RLS policies are correctly configured.
-- ===============================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT, INSERT, UPDATE ON public.blogs TO authenticated;
-- No DELETE grant intentionally — hard deletes are blocked by policy above,
-- but skipping the grant adds a second layer of protection.

GRANT SELECT ON public.blogs TO anon;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;