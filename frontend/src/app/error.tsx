"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export default function GlobalError({ error }: { error: Error }) {
  useEffect(() => {
    toast.error(error.message);
  }, [error]);

  return <p>Unexpected error occurred</p>;
}