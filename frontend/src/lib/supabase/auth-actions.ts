"use server";

import { createSupabaseServerClient } from "./server";
import { redirect } from "next/navigation";

export async function signUpAction(
	name: string,
	email: string,
	password: string
) {
	const supabase = await createSupabaseServerClient();

	try {
		// Sign up the user
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					name,
				},
			},
		});

		if (error) {
			return { error: error.message };
		}

		return { data, success: true };
	} catch (error) {
		return {
			error:
				error instanceof Error
					? error.message
					: "An unexpected error occurred",
		};
	}
}

export async function signInAction(email: string, password: string) {
	const supabase = await createSupabaseServerClient();

	try {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			return { error: error.message };
		}

		// Session is established, cookies are set by Supabase
		return { data, success: true };
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
		console.error("Sign in error:", errorMessage);
		return { error: errorMessage };
	}
}

export async function signOutAction() {
	const supabase = await createSupabaseServerClient();

	try {
		const { error } = await supabase.auth.signOut();

		if (error) {
			return { error: error.message };
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
		console.error("Sign out error:", errorMessage);
		return { error: errorMessage };
	}

	// Important: Redirect OUTSIDE try-catch to prevent NEXT_REDIRECT from being caught
	redirect("/login");
}

export async function getCurrentUser() {
	const supabase = await createSupabaseServerClient();

	try {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		return user;
	} catch (error) {
		console.error("Error fetching user:", error);
		return null;
	}
}

export async function signInWithGoogle() {
	const supabase = await createSupabaseServerClient();

	try {
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
				skipBrowserRedirect: true,
			},
		});

		if (error) {
			return { error: error.message };
		}

		// Return the URL to redirect to
		return { url: data?.url, success: true };
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
		console.error("Google sign in error:", errorMessage);
		return { error: errorMessage };
	}
}