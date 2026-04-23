"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getBlogs = async () => {
  const supabase = await createSupabaseServerClient();
  
  const {data: { user },} = await supabase.auth.getUser();
  if (!user) throw new Error("User not logged in");
  
  const { data, error } = await supabase
    .from("blogs")
    .select("id, title, description,status,created_at, image_url")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .eq("user_id", user.id);

  if (error) throw error;
  return data;
};


export const getBlogById = async (id: string) => {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("blogs")
    .select("id, title, description,status,created_at, image_url")
    .eq("id", id)
    .is("deleted_at", null)
    .eq("user_id", user.id)
    .maybeSingle(); // IMPORTANT CHANGE

  if (error) {
    throw error;
  }

  // Handle "not found OR not owner"
  if (!data) {
    throw new Error("Blog not found or access denied");
  }

  return data;
};


export const createBlog = async (payload: any) => {
  const supabase = await createSupabaseServerClient();

  const {data: { user },} = await supabase.auth.getUser();
	if (!user) throw new Error("User not logged in");
  
  console.log("in create blog");
  console.log(user.id);
  const { error } = await supabase.from("blogs").insert([
    {
      ...payload,
      user_id: user.id, // ✅ now matches auth.uid()
    },
  ]);

  if (error) throw error;
};


export const updateBlog = async (id: string, payload: any) => {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("blogs")
    .update(payload)
    .eq("id", id);

  if (error) throw error;
};

/**
 * Server Action: Delete Blog (Soft Delete)
 * Simple direct update - just set deleted_at timestamp
 */
export async function deleteBlog(id: string) {
  const supabase = await createSupabaseServerClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not logged in");
    }

    console.log("Deleting blog:", id, "for user:", user.id);

    // Simple direct update - just set deleted_at
    const { error } = await supabase
      .from("blogs")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Delete failed:", error);
      throw error;
    }

    return { success: true };
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

export async function getAllBlogs(page = 1, limit = 8) {
  const supabase = await createSupabaseServerClient();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("blogs")
    .select("id, title, description, status, created_at, image_url", {
      count: "exact", // important
    })
    .eq("status", "Active")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    data,
    total: count,
  };
}