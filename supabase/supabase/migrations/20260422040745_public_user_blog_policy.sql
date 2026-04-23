CREATE POLICY "Public can view active blogs"
ON blogs
FOR SELECT
USING (status = 'Active');