import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .min(3, "Name must be at least 3 characters")
      .max(100, "Name must be less than 100 characters"),

    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Invalid email address")
      .max(100, "Email must be less than 100 characters"),

    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),

    confirm_password: z
      .string()
      .min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });