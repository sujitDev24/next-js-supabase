import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/app/context/AuthContext";
import { getCurrentUser } from "@/lib/supabase/auth-actions";
import { ThemeProvider } from "@/app/context/ThemeContext";
import { Toaster } from "sonner";
import QueryProvider from "@/app/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Test NextJS",
  description: "Test the next app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get the initial user from the server
  const initialUser = await getCurrentUser();
  
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider initialUser={initialUser}>
            <main>
              <QueryProvider>
                {children}
              </QueryProvider>
              <Toaster position="top-right" richColors />
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
