"use client";

import { useEffect, useState } from "react";
import { useBlogs } from "@/lib/hooks/useBlogs";
import { getAllBlogs } from "@/lib/blog";
import { useQueryClient } from "@tanstack/react-query";
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
  const limit = 4;
  const [page, setPage] = useState(1);
  const {data, isLoading, error, isError} = useBlogs(page, limit);
  const totalPages = Math.ceil((data?.total || 0)/limit);
  const queryClient = useQueryClient();
  /*
    PREFETCH NEXT PAGE  
  */
  useEffect(()=>{
    if(page < totalPages){
      queryClient.prefetchQuery({
        queryKey:["blogs",page+1],
        queryFn:()=>getAllBlogs(page+1, limit),
      });
      
    }
  },[page, totalPages, queryClient]);

  useEffect(() => {
    if(isError && error){
      toast.error(
        error instanceof Error
        ? error.message
        : "Failed to fetch blogs"
      );
    }
  }, [isError,error]);

  if(isLoading){
    return <p>Loading...</p>;
  }

  if(isError){
    return <p>Unable to load blogs.</p>;
  }
  
  return (
    <div className="container mx-auto py-6">
      <h2 className="text-2xl font-bold mb-6">Blogs</h2>

      {/* ✅ Blog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {data?.data?.map((blog:any) => (
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