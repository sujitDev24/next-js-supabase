"use client";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { signOutAction } from "@/lib/supabase/auth-actions";
import { Button } from "./ui/button";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

export default function BackendNavbar() {
    const { user, loading } = useAuth();
    const [signingOut, setSigningOut] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleSignOut = async () => {
        setSigningOut(true);
        setError(null);
        try {
            const result = await signOutAction();
            if (result?.error) {
                setError(result.error);
                setSigningOut(false);
            }
        } catch (err) {
            // NEXT_REDIRECT is a Next.js control flow error, not a real error
            const errorMessage = err instanceof Error ? err.message : 'Sign out failed';
            if (errorMessage === 'NEXT_REDIRECT') {
                // Redirect is happening successfully, don't show error
                return;
            }
            setError(errorMessage);
            setSigningOut(false);
        }
    };

    return (
        <nav className="bg-red-800 p-4">
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/" className="text-white text-lg font-bold">
                    MyApp
                </Link>
                <div className="flex gap-4 items-center">
                    <Link
                        href="/"
                        className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                        Home
                    </Link>

                    {loading ? (
                        <div className="text-gray-300 text-sm">Loading...</div>
                    ) : user ? (
                        <>
                            <Link
                                href="/blogs"
                                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Blogs
                            </Link>
                            <div className="text-gray-300 text-sm">
                                Welcome, <span className="font-semibold">{user.email}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button
                                    onClick={handleSignOut}
                                    disabled={signingOut}
                                    variant="outline"
                                    size="sm"
                                >
                                    {signingOut ? "Signing out..." : "Logout"}
                                </Button>
                                {error && (
                                    <div className="text-red-500 text-xs text-center">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="outline" size="sm">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">Register</Button>
                            </Link>
                        </>
                    )}
                </div>

                <ThemeToggle />
            </div>
        </nav>
    );
}
