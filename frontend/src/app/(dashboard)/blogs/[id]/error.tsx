"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    toast.error(error.message || "Something went wrong");
  }, [error]);

  return (
    <div className="p-6">
      <p className="text-red-500">Something went wrong</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}