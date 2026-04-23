import { z } from "zod";

export const blogSchema = z.object({
  title: z
    .string()
		.min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),

  description: z
    .string()
    .min(10, "description must be at least 10 characters"),

  image: z
    .instanceof(File)
    .optional()
    .nullable()
    .refine((file) => !file || file.size < 5 * 1024 * 1024, {
      message: "Image must be less than 5MB",
    }),
});