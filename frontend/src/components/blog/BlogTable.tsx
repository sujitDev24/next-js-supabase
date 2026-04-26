"use client";

import { MoreHorizontalIcon } from "lucide-react"
import { useEffect, useState } from "react";
import { getBlogs, deleteBlog } from "@/lib/blog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { toast } from "sonner";
import AppPagination from "@/components/common/AppPagination";

type Blog = {
  id: string;
  title: string;
};

export default function BlogTable() {
	
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  const limit = 4;
  
  const router = useRouter();

  useEffect(() => {
    loadBlogs();
  }, [page]);

  const loadBlogs = async () => {
    const res = await getBlogs(page, limit);
    setBlogs(res.data);
    setTotal(res.total || 0);
  };

  const totalPages = Math.ceil(total / limit);


  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this blog?");
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      console.log("In the table listing", id)
      // Call server action to delete
      const result = await deleteBlog(id);
      
      console.log("Delete result:", result);

      // Optimistic UI update
      setBlogs((prev: any) => prev.filter((b: any) => b.id !== id));
      
      toast.success("Blog deleted successfully!")
    } catch (err) {
      console.error("Delete error:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to delete blog";
      
      toast.error(errorMsg)
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6">
        <div className="flex justify-end w-full">
          <Button 
            className="bg-sky-700"
            onClick={() => router.push("/blogs/create")}>
              + Create Blog
          </Button>
        </div>
        <div className="mt-4 border rounded-lg">
            <Table className="w-full">
                <TableHeader className="bg-gray-100">
                    <TableRow>
                        <TableHead className="p-3 text-left">Title</TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                {blogs.map((blog: any) => (
                    <TableRow key={blog.id} className="border-t">
                        <TableCell className="p-3">{blog.title}</TableCell>
                        <TableCell>
                          {blog.image_url && (
                            <img src={blog.image_url} alt="blog" width={50} />
                          )}
                        </TableCell>
                        <TableCell>{blog.status === "Active" ? "Active" : "Inactive"}</TableCell>
                        <TableCell className="space-x-2 text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="size-8">
                                    <MoreHorizontalIcon />
                                    <span className="sr-only">Open menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => router.push(`/blogs/${blog.id}/edit`)}
                                        >
                                        Edit
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={() => router.push(`/blogs/${blog.id}`)}
                                        >
                                        View
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                    className="text-red-600 cursor-pointer"
                                    onClick={() => handleDelete(blog.id)}
                                    disabled={isDeleting}
                                    >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
            <AppPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
        </div>
    </div>
  );
}