"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseBrowserClient();

  const [sessionLoading, setSessionLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: "",
  });

  // ✅ Step 1: Create session from reset link
  useEffect(() => {
    const initSession = async () => {
      const code = searchParams.get("code");
      if (!code) {
        setError("Invalid or expired reset link");
        setSessionLoading(false);
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        setError("Invalid or expired reset link");
      }

      setSessionLoading(false);
    };

    initSession();
  }, [supabase, searchParams]);

  // Handle input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // ✅ Step 2: Update password
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.new_password || !formData.confirm_password) {
      setError("All fields are required");
      return;
    }

    if (formData.new_password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.new_password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess("Password reset successfully! Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Loading state while verifying reset link
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Verifying reset link...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Enter your new password</CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
                  {success}
                </div>
              )}

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  type="password"
                  id="new_password"
                  placeholder="••••••••"
                  value={formData.new_password}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              {/* Confirm Password */}
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
                  disabled={loading}
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>

              {/* Back to login */}
              <div className="text-center pt-4 border-t border-gray-200">
                <Link
                  href="/login"
                  className="text-sm text-primary hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}