"use client";

import { useEffect, useState } from "react";
import { getAllBlogs } from "@/lib/blog";
import Link from "next/link";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppPagination from "@/components/common/AppPagination";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 4;

  useEffect(() => {
    const fetchBlogs = async () => {
      try { 
        const res = await getAllBlogs(page, limit);
        setBlogs(res.data);
        setTotal(res.total || 0);
        toast.success("Blog fetched successfully")
      } catch (error: any) {
        toast.error(error.message);
      }
    };

    fetchBlogs();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto py-6">
      <h2 className="text-2xl font-bold mb-6">Blogs</h2>

      {/* ✅ Blog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {blogs.map((blog) => (
          <Card
            key={blog.id}
            className="overflow-hidden rounded-xl hover:shadow-lg transition"
          >
            {/* Image */}
            <div className="relative">
              <img
                src={blog.image_url || "/images_preview.png"}
                alt={blog.title}
                className="w-full h-40 object-cover"
              />
            </div>

            {/* Content */}
            <CardContent className="p-4 space-y-2">
              <CardTitle className="text-md line-clamp-2">
                {blog.title}
              </CardTitle>

              <CardDescription>
                {blog.description?.slice(0, 70)}...
              </CardDescription>

              <p className="text-xs text-muted-foreground">
                {new Date(blog.created_at).toDateString()}
              </p>
            </CardContent>

            <CardFooter>
              <Link href={`/blog/${blog.id}`} className="w-full">
                <Button variant="outline" className="w-full">
                  View Blog
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
      <AppPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
     
    </div>
  );
}