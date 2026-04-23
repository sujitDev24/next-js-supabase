"use client";

import React, { ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

interface AuthContextType {
	user: User | null;
	loading: boolean;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
	children,
	initialUser,
}: {
	children: ReactNode;
	initialUser: User | null;
}) {
	const [user, setUser] = React.useState<User | null>(initialUser);
	const [loading, setLoading] = React.useState(false);

	React.useEffect(() => {
		const supabase = getSupabaseBrowserClient();

		console.log("[AuthProvider] Setting up auth listener, initial user:", initialUser?.email);

		// Subscribe to auth changes
		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			(_event: string, session: any) => {
				
				// Don't overwrite initialUser with null on INITIAL_SESSION
				// This happens because browser client can't read HttpOnly cookies
				if (_event === 'INITIAL_SESSION' && !session?.user && initialUser) {
					return;
				}
				
				setUser(session?.user ?? null);
				setLoading(false);
			}
		);

		return () => {
			subscription?.unsubscribe();
		};
	}, [initialUser]);

	return (
		<AuthContext.Provider value={{ user, loading }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = React.useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
}
