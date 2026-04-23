"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ForgotPasswordPage() {
  const supabase = getSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState("");
	

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
		setSuccess(null);
    
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setLoading(true);
		if (loading) return;
		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
			});

			if (error) {
				if (error.message.includes("rate limit")) {
					setError("Too many requests. Please wait a minute before trying again.");
				} else {
					setError(error.message);
				}
				return;
			}

			setEmail("");
			setSuccess("If an account with that email exists, a reset link has been sent.");

		} catch (err) {
			setError("An error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
    
  };
	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4">
			<div className="max-w-md mx-auto">
				<Card>
					<CardHeader>
						<CardTitle>Forgot Password</CardTitle>
						<CardDescription>Enter your email to receive a password reset link</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="space-y-5" onSubmit={handleSubmit}>
							{error && (
								<div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
									{error}
								</div>
							)}

							{success && (
								<div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
									{success}
								</div>
							)}

							<div className="space-y-2">
								<Label htmlFor="email">Email Address</Label>
								<Input
									type="email"
									id="email"
									placeholder="your@email.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									disabled={loading}
								/>
							</div>

							<Button
								type="submit"
								className="w-full bg-primary hover:bg-primary/90"
								disabled={loading}
							>
								{loading ? "Sending..." : "Send Reset Link"}
							</Button>

							<div className="text-center pt-4 border-t border-gray-200 space-y-2">
								<p className="text-sm text-gray-600">
									Remember your password?
								</p>
								<Link href="/login" className="text-primary font-semibold hover:underline text-sm">
									Login
								</Link>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}