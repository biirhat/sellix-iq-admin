-- Grant super_admins permission to update any user's profile.
CREATE POLICY "Super admins can update any user"
ON public.users FOR UPDATE
USING ( (get_my_claim('user_role'::text)) = '"super_admin"'::jsonb )
WITH CHECK ( (get_my_claim('user_role'::text)) = '"super_admin"'::jsonb );
