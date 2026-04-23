import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");

	if (code) {
		const supabase = await createSupabaseServerClient();
		
		try {
			// Exchange the code for a session
			const { error } = await supabase.auth.exchangeCodeForSession(code);

			if (!error) {
				// Redirect to home page after successful auth
				return NextResponse.redirect(new URL("/", requestUrl.origin));
			}
		} catch (err) {
			console.error("Error exchanging code for session:", err);
		}
	}

	// If something goes wrong, redirect to sign-in
	return NextResponse.redirect(new URL("/login?error=auth-failed", requestUrl.origin));
}
