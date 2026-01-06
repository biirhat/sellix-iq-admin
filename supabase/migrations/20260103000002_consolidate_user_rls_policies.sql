-- This migration consolidates all RLS policies for the public.users table.
-- It ensures a clean slate by dropping existing policies before creating new ones.

-- 1. Enable RLS on the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies on public.users to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to read user data" ON public.users;
DROP POLICY IF EXISTS "Allow individual users to update their own data" ON public.users;
DROP POLICY IF EXISTS "Allow super_admins to update any user data" ON public.users;
DROP POLICY IF EXISTS "Allow super_admins to delete any user" ON public.users;
DROP POLICY IF EXISTS "Super admins can update any user" ON public.users;


-- 3. CREATE SELECT POLICY
-- Allow any authenticated user to view all user profiles.
CREATE POLICY "Allow authenticated users to read user data"
ON public.users FOR SELECT
TO authenticated
USING (true);


-- 4. CREATE UPDATE POLICY
-- Allow users to update their own profile, and allow super_admins to update any profile.
CREATE POLICY "Allow individual and super_admin updates"
ON public.users FOR UPDATE
USING (
  auth.uid() = id OR
  (get_my_claim('user_role'::text)) = '"super_admin"'::jsonb
)
WITH CHECK (
  auth.uid() = id OR
  (get_my_claim('user_role'::text)) = '"super_admin"'::jsonb
);


-- 5. CREATE DELETE POLICY
-- Only allow super_admins to delete users.
CREATE POLICY "Allow super_admins to delete any user"
ON public.users FOR DELETE
USING ( (get_my_claim('user_role'::text)) = '"super_admin"'::jsonb );


-- NOTE: There is no INSERT policy for the `users` table.
-- User creation should be handled exclusively by secure Edge Functions
-- (like `create-user-with-role`) that use the `service_role` key to bypass RLS.
-- This prevents users from creating accounts directly from the client-side.
