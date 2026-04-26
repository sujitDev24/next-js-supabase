import { notFound } from "next/navigation";
import BlogForm from "@/components/blog/BlogForm";
import { getBlogById } from "@/lib/blog";

export default async function Page({ params }: any) {
  const resolvedParams = await params;

  if (!resolvedParams?.id) {
    notFound();
  }

  let blog;

  try {
    blog = await getBlogById(resolvedParams.id);
  } catch (error) {
    // 👇 Handles:
    // - Not owner
    // - Blog not found
    // - Unauthorized
    notFound();
  }

  return <BlogForm blog={blog} />;
}