"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpAction } from "@/lib/supabase/auth-actions";
import { toast } from "sonner";
import { registerSchema } from "@/lib/validations/auth";

export default function SignUp() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [success, setSuccess] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirm_password: "",
	});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[id]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);

		// Validation
		// if (
		// 	!formData.name ||
		// 	!formData.email ||
		// 	!formData.password ||
		// 	!formData.confirm_password
		// ) {
		// 	setError("All fields are required");
		// 	return;
		// }

		// if (formData.password !== formData.confirm_password) {
		// 	setError("Passwords do not match");
		// 	return;
		// }

		// if (formData.password.length < 6) {
		// 	setError("Password must be at least 6 characters");
		// 	return;
		// }
		const result = registerSchema.safeParse(formData);

		//VALIDATION ERROR HANDLING
		if (!result.success) {
			const fieldErrors = result.error.flatten().fieldErrors;

			setErrors({
				name: fieldErrors.name?.[0] || "",
				email: fieldErrors.email?.[0] || "",
				password: fieldErrors.password?.[0] || "",
				confirm_password: fieldErrors.confirm_password?.[0] || "",
			});

			toast.error("Please fix the highlighted errors");
			return;
		}
		setLoading(true);
		setErrors({});

		try {
			const result = await signUpAction(
				formData.name,
				formData.email,
				formData.password
			);

			if (result.error) {
				setError(result.error);
				setLoading(false);
			} else {
				setSuccess(true);
				toast.success("Registration successful");
				// Redirect to sign in after 2 seconds
				setTimeout(() => {
					router.push(
						`/login?email=${encodeURIComponent(formData.email)}`
					);
				}, 2000);
			}
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "An error occurred. Please try again."
			);
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Sign Up</CardTitle>
					<CardDescription>
						Create a new account to get started
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-5" onSubmit={handleSubmit}>
						{success && (
							<div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
								✓ Account created successfully! Redirecting to sign
								in...
							</div>
						)}

						{error && (
							<div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
								{error}
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="name">Full Name</Label>
							<Input
								type="text"
								id="name"
								placeholder="John Doe"
								value={formData.name}
								onChange={handleInputChange}
								disabled={loading || success}
							/>
							{errors.name && (
							<p className="text-red-500 text-sm mt-1">{errors.name}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								type="email"
								id="email"
								placeholder="your@email.com"
								value={formData.email}
								onChange={handleInputChange}
								disabled={loading || success}
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
								disabled={loading || success}
							/>
							{errors.password && (
							<p className="text-red-500 text-sm mt-1">{errors.password}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirm_password">
								Confirm Password
							</Label>
							<Input
								type="password"
								id="confirm_password"
								placeholder="••••••••"
								value={formData.confirm_password}
								onChange={handleInputChange}
								disabled={loading || success}
							/>
							{errors.confirm_password && (
								<p className="text-red-500 text-sm mt-1">
									{errors.confirm_password}
								</p>
							)}
						</div>

						<Button
							type="submit"
							className="w-full bg-primary hover:bg-primary/90"
							disabled={loading || success}
						>
							{loading
								? "Creating account..."
								: success
									? "Redirecting..."
									: "Sign Up"}
						</Button>
					</form>

					<p className="text-sm text-gray-600 mt-6 text-center">
						Already have an account?{" "}
						<Link
							href="/login"
							className="text-primary font-semibold hover:underline"
						>
							Login
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
