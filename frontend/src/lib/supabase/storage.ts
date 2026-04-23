import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export const uploadBlogImage = async (file: File) => {
  const supabase = getSupabaseBrowserClient();

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("blog-images")
    .upload(fileName, file);

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from("blog-images")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};