import type { ReactNode } from "react";
import Navbar from "@/components/backend-navbar";

export default async function BackendLayout({
  children,
}: {
  children: ReactNode;
}) {

  return <>
    <Navbar />
    {children}
  </>;
}