"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInAction, signInWithGoogle } from "@/lib/supabase/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { loginSchema } from "@/lib/validations/login";

export default function LoginPage() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.id]: e.target.value,
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		const result = loginSchema.safeParse(formData);

		//VALIDATION ERROR HANDLING
		if (!result.success) {
			const fieldErrors = result.error.flatten().fieldErrors;
			console.log(fieldErrors)
			setErrors({
				email: fieldErrors.email?.[0] || "",
				password: fieldErrors.password?.[0] || "",
			});

			toast.error("Please fix the highlighted errors");
			setLoading(false);
			return;
			
		}
		setErrors({});

		try {
			
			const result = await signInAction(formData.email, formData.password);

			if (result.error) {
				setError(result.error);
				setLoading(false);
			} else {
				console.log("[SignIn] Login successful, redirecting to home");
				toast.success("Login successfully");
				// Navigate to home - hard refresh to ensure proxy.ts runs
				window.location.href = "/";
				
			}
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to sign in. Please check your credentials and try again."
			);
			setLoading(false);
		}
	};

	const handleGoogleLogin = async () => {
		setError(null);
		setLoading(true);
		try {
			const result = await signInWithGoogle();

			if (result?.url) {
				// Redirect to Google OAuth provider
				window.location.href = result.url;
			} else {
				setError("Failed to initiate Google sign in. Please try again.");
				setLoading(false);
			}
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to initiate Google sign in. Please try again."
			);
			setLoading(false);
		}
	};

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Sign In</CardTitle>
					<CardDescription>Enter your credentials to sign in to your account</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-5" onSubmit={handleSubmit}>
						{error && (
						<div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
							{error}
						</div>
						)}

						<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input 
							type="email" 
							id="email" 
							placeholder="your@email.com"
							value={formData.email}
							onChange={handleInputChange}
							disabled={loading}
						/>
						{errors.email && (
						<p className="text-red-500 text-sm mt-1">{errors.email}</p>
						)}
						</div>
						
						<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input 
							type="password" 
							id="password" 
							placeholder="••••••••"
							value={formData.password}
							onChange={handleInputChange}
							disabled={loading}
						/>
						{errors.password && (
							<p className="text-red-500 text-sm mt-1">{errors.password}</p>
							)}
						<Link href="/forgot-password" className="text-xs text-primary hover:underline">
							Forgot password?
						</Link>
						</div>

						<Button 
							type="submit"
							className="w-full bg-primary hover:bg-primary/90"
							disabled={loading}
						>
							{loading ? "Signing in..." : "Sign In"}
						</Button>
					</form>
					<p className="text-sm text-gray-600 mt-4 text-center">
						<Button 
							type="button"
							onClick={handleGoogleLogin}
							className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1a73e8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:bg-[#1662c4]">
							Sign in with Google
						</Button>
					</p>

					<p className="text-sm text-gray-600 mt-6 text-center">
						Don't have an account?{" "}
						<Link href="/register" className="text-primary font-semibold hover:underline">
						Register
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
    );
}