import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getErrorMessage(error: any) {
  if (error?.message) return error.message;
  return "Something went wrong";
}