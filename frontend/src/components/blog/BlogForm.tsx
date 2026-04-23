"use client";

import { useState } from "react";
import { createBlog, updateBlog } from "@/lib/blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { uploadBlogImage } from "@/lib/supabase/storage";
import { getFilePathFromUrl, deleteImage } from "@/lib/utils/storage";
import { toast } from "sonner";
import { blogSchema } from "@/lib/validations/blog";

export default function BlogForm({ blog }: any) {
  const [title, setTitle] = useState(blog?.title || "");
  const [description, setDescription] = useState(
    blog?.description || ""
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [preview, setPreview] = useState<string | null>(blog?.image_url || null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageFile(file);

    // Generate preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = {
        title,
        description,
        image: imageFile || null,
      };

      const result = blogSchema.safeParse(formData);

      // ❗ HANDLE VALIDATION ERRORS (INLINE)
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;

        setErrors({
          title: fieldErrors.title?.[0] || "",
          description: fieldErrors.description?.[0] || "",
          image: fieldErrors.image?.[0] || "",
        });

        toast.error("Please fix the highlighted errors");
        return;
      }

      // ✅ Clear previous errors
      setErrors({});

      let imageUrl = blog?.image_url || "";

      if (imageFile) {
        const newImageUrl = await uploadBlogImage(imageFile);

        if (blog?.image_url) {
          const oldPath = getFilePathFromUrl(blog.image_url);

          try {
            await deleteImage(oldPath);
          } catch (err) {
            console.error("Delete failed:", err);
          }
        }

        imageUrl = newImageUrl;
      }

      if (blog) {
        await updateBlog(blog.id, {
          title,
          description,
          image_url: imageUrl,
        });

        toast.success("Blog updated successfully");
      } else {
        await createBlog({
          title,
          description,
          image_url: imageUrl,
        });

        toast.success("Blog created successfully");
      }

      router.push("/blogs");

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 max-w-xl space-y-4">
      <Input
        placeholder="Title"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setErrors((prev) => ({ ...prev, title: "" })); // clear error on typing
        }}
      />
      {errors.title && (
        <p className="text-red-500 text-sm mt-1">{errors.title}</p>
      )}

      <Textarea
        placeholder="Description"
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
          setErrors((prev) => ({ ...prev, description: "" }));
        }}
      />
      {errors.description && (
        <p className="text-red-500 text-sm mt-1">{errors.description}</p>
      )}

      <Input
        type="file"
        accept="image/*"
        onChange={(e) => {
          handleFileChange(e);
          setErrors((prev) => ({ ...prev, image: "" }));
        }}
      />
      {errors.image && (
        <p className="text-red-500 text-sm mt-1">{errors.image}</p>
      )}
      
      {preview && (
        <img
          src={preview}
          alt="preview"
          width={100}
          className="mt-2 rounded"
        />
      )}
      <div className="flex justify-end w-full gap-2 items-center"> 
  {/* Primary Action Button */}
  <Button 
    className="bg-sky-700 text-white px-4 h-10 inline-flex items-center justify-center rounded-md text-sm font-medium border border-transparent shadow-sm"
    onClick={handleSubmit}>
    {blog ? "Update" : "Create"}
  </Button>

  {/* Cancel Link Styled as Button */}
  <Link 
    href="/blogs" 
    className="bg-gray-200 text-gray-800 px-4 h-10 inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-300 transition-colors"
  >
    Cancel
  </Link>
</div>

        
    </div>
  );
}