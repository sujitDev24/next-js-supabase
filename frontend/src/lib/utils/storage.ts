import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export const getFilePathFromUrl = (url: string) => {
  const parts = url.split("/blog-images/");
  return parts[1];
};

export const deleteImage = async (path: string) => {
  const supabase = getSupabaseBrowserClient();
	console.log("in the utils file");
  const { error } = await supabase.storage
    .from("blog-images")
    .remove([path]);

  if (error) {
    console.error("Error deleting image:", error);
  }
};