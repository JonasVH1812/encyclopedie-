-- ============================================================
-- STEP 1: Drop policies that reference extra_tags FIRST
-- ============================================================

DROP POLICY IF EXISTS "profiles_update_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_update_owner" ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_select_all"   ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"   ON profiles;

-- Also drop any old ones just in case
DROP POLICY IF EXISTS "Users can view all profiles"      ON profiles;
DROP POLICY IF EXISTS "Users can update own profile"     ON profiles;
DROP POLICY IF EXISTS "admin_can_update_profiles"        ON profiles;
DROP POLICY IF EXISTS "Allow own profile insert"         ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile"     ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated"  ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile"    ON profiles;
DROP POLICY IF EXISTS "Enable update for admins"         ON profiles;


-- ============================================================
-- STEP 2: Now safe to alter the column
-- ============================================================

ALTER TABLE profiles
  ALTER COLUMN extra_tags SET DEFAULT '{}';

ALTER TABLE profiles
  ALTER COLUMN extra_tags TYPE text[]
  USING COALESCE(extra_tags::text[], '{}');

UPDATE profiles
SET extra_tags = '{}'
WHERE extra_tags IS NULL;


-- ============================================================
-- STEP 3: Recreate all policies
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all"
ON profiles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  AND extra_tags = (SELECT extra_tags FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "profiles_update_owner"
ON profiles FOR UPDATE TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'Owner'
)
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'Owner'
);

CREATE POLICY "profiles_update_admin"
ON profiles FOR UPDATE TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'Admin'
  AND (SELECT role FROM profiles WHERE id = profiles.id) = 'Member'
)
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'Admin'
  AND role = (SELECT role FROM profiles WHERE id = profiles.id)
);


-- ============================================================
-- STEP 4: Signup trigger
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, role, extra_tags)
  VALUES (
    NEW.id,
    split_part(NEW.email, '@', 1),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE WHEN NEW.email = 'removed@example.com' THEN 'Owner' ELSE 'Member' END,
    '{}'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- STEP 5: Role/tag protection trigger
-- ============================================================

DROP TRIGGER IF EXISTS on_profile_role_change ON profiles;
DROP FUNCTION IF EXISTS public.enforce_role_change();

CREATE OR REPLACE FUNCTION public.enforce_role_change()
RETURNS trigger AS $$
DECLARE
  requester_role text;
BEGIN
  IF NEW.role IS NOT DISTINCT FROM OLD.role
     AND NEW.extra_tags IS NOT DISTINCT FROM OLD.extra_tags THEN
    RETURN NEW;
  END IF;

  SELECT role INTO requester_role FROM profiles WHERE id = auth.uid();

  IF requester_role = 'Owner' THEN RETURN NEW; END IF;

  IF requester_role = 'Admin' THEN
    IF NEW.role IS NOT DISTINCT FROM OLD.role AND OLD.role = 'Member' THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Admins can only change tags on Members, not roles.';
  END IF;

  IF auth.uid() = OLD.id
     AND NEW.role IS NOT DISTINCT FROM OLD.role
     AND NEW.extra_tags IS NOT DISTINCT FROM OLD.extra_tags THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Only the Owner can change roles and tags.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_role_change
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION public.enforce_role_change();


-- ============================================================
-- STEP 6: Backfill
-- ============================================================

INSERT INTO profiles (id, username, display_name, role, extra_tags)
SELECT
  u.id,
  split_part(u.email, '@', 1),
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  CASE WHEN u.email = 'removed@example.com' THEN 'Owner' ELSE 'Member' END,
  '{}'
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

UPDATE profiles SET role = 'Owner'
WHERE id = (SELECT id FROM auth.users WHERE email = 'removed@example.com');

UPDATE profiles SET extra_tags = '{}' WHERE extra_tags IS NULL;


-- ============================================================
-- STEP 7: Comments table
-- ============================================================

CREATE TABLE IF NOT EXISTS post_comments (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content    text NOT NULL CHECK (char_length(content) > 0),
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_select_all" ON post_comments;
DROP POLICY IF EXISTS "comments_insert_own" ON post_comments;
DROP POLICY IF EXISTS "comments_delete"     ON post_comments;

CREATE POLICY "comments_select_all"
ON post_comments FOR SELECT TO authenticated
USING (true);

CREATE POLICY "comments_insert_own"
ON post_comments FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "comments_delete"
ON post_comments FOR DELETE TO authenticated
USING (
    user_id = auth.uid()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Owner', 'Admin')
);

-- ============================================================
-- STEP 8: Fix FK so PostgREST can embed profiles via post_comments_user_id_fkey
-- ============================================================

ALTER TABLE post_comments
  DROP CONSTRAINT IF EXISTS post_comments_user_id_fkey;

ALTER TABLE post_comments
  ADD CONSTRAINT post_comments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;