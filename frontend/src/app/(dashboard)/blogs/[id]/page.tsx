import { getBlogById } from "@/lib/blog";
import Link from "next/link";

export default async function Page({ params }: any) {
  const resolvedParams = await params;

  if (!resolvedParams?.id) {
    throw new Error("ID is missing");
  }

  const blog = await getBlogById(resolvedParams.id);

  return (
    <div className="p-6 max-w-3xl mx-auto">
			<Link href="/blogs">Back to Blogs</Link>
      <h1 className="text-3xl font-bold">{blog.title}</h1>
      <p className="mt-4">{blog.description}</p>
    </div>
  );
}