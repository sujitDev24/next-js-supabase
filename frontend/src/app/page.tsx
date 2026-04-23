"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { toast } from "sonner";
import BlogCard from "@/components/blog/BlogCard";

export default function Home() {
  const supabase = getSupabaseBrowserClient();
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const { data, error } = await supabase
  //       .from("test_users")
  //       .select("*");

  //     if (error) {
  //       console.error(error);
  //     } else {
  //       console.log(data);
  //       setUsers(data);
  //     }
  //   };

  //   fetchData();
  // }, []);

  // const [blogs, setBlogs] = useState<any[]>([]);

  // useEffect(() => {
  //   const fetchBlog = async () => {
  //     try {
  //       const data = await getAllBlogs();
  //       setBlogs(data);
  //     } catch (error: any) {
  //       toast.error(error.message);
  //     }
  //   };

  //   fetchBlog();
  // }, []);
  
  useEffect(() => {
    const callFunction = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      
      // const res = await fetch(
      //   "https://kmtnzbmdtphokvxkhbku.supabase.co/functions/v1/hello",
      //   {
      //     method: "GET",
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );
      // const data = await res.json();
      
      //Using Supabase Client (Best Way in Apps)
      const { data, error } = await supabase.functions.invoke("hello", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });    
      console.log("data", data);
    };
    callFunction();
  }, []);

  //code for the public blogs
  function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

  return (
    <div className="flex min-h-screen flex-col justify-between p-24">
      <h1 className="text-4xl font-bold">
        Hello, {user?.email ?? "World!"}
      </h1>
      <Image
        src="/vercel.svg"
        alt="Vercel Logo"
        width={200}
        height={200}
        className="mt-4"
      />
      
      <h2>Staging branch</h2>
      <BlogCard></BlogCard>
      
    </div>
  );
}