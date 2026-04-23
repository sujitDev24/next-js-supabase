import type { ReactNode } from "react";
import { redirect } from "next/navigation";

export default async function MentorLayout({
  children,
}: {
  children: ReactNode;
}) {
//   const role = await getUserRole();

//   if (role !== "admin") {
//     redirect("/unauthorized");
//   }

  return <>"From mentor layout" {children}</>;
}