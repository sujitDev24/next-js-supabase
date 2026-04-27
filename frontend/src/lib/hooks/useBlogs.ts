import { useQuery } from "@tanstack/react-query";
import { getAllBlogs } from "@/lib/blog";

export function useBlogs(page:number, limit:number){
	return useQuery({
  	queryKey:["blogs",page],
  	queryFn:() => getAllBlogs(page,limit),

  	placeholderData:(previousData)=>previousData,
 	});
}