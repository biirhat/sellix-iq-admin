-- ١. پاقژکرنا پۆڵیسیێن کەفن
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users and admins can insert avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users and admins can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users and admins can delete avatars" ON storage.objects;

-- ٢. دروستکرنا باکێت (ئەگەر نەهاتبیە دروستکرن)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ٣. پۆڵیسیا INSERT: بەکارهێنەر یان Admin
CREATE POLICY "Users and admins can insert avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND (
    (storage.foldername(name))[1] = auth.uid()::text OR 
    (SELECT public.is_super_admin())
  )
);

-- ٤. پۆڵیسیا UPDATE: خودانێ فایلێ یان Admin
CREATE POLICY "Users and admins can update avatars"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars' AND (
    owner = auth.uid() OR 
    (SELECT public.is_super_admin())
  )
);

-- ٥. پۆڵیسیا DELETE: خودانێ فایلێ یان Admin
CREATE POLICY "Users and admins can delete avatars"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars' AND (
    owner = auth.uid() OR 
    (SELECT public.is_super_admin())
  )
);

-- ٦. پۆڵیسیا SELECT: دیتن بۆ هەمییان
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );