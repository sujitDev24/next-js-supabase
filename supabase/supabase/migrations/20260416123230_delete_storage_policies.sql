DROP POLICY IF EXISTS "Allow delete own images" ON storage.objects;

CREATE POLICY "Allow delete own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-images'
);