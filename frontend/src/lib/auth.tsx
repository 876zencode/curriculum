import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseClient } from "./supabaseClient";

type AuthState = {
  user: User | null;
  session: Session | null;
  status: "loading" | "ready";
  isConfigured: boolean;
  firstName: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    if (!supabaseClient) {
      setStatus("ready");
      return;
    }

    supabaseClient.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
      })
      .finally(() => setStatus("ready"));

    const { data: subscription } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    return () => {
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!supabaseClient) {
      throw new Error("Supabase is not configured for auth.");
    }

    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.href,
      },
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
  };

  const value = useMemo<AuthState>(
    () => ({
      user,
      session,
      status,
      isConfigured: isSupabaseConfigured && Boolean(supabaseClient),
      firstName: deriveFirstName(user),
      signInWithGoogle,
      signOut,
    }),
    [session, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

function deriveFirstName(user: User | null): string | null {
  if (!user) return null;
  const meta = user.user_metadata || {};
  const fullName: string | undefined = (meta.full_name as string) || (meta.name as string);
  const firstFromName = fullName?.trim().split(/\s+/)?.[0];
  if (firstFromName) return firstFromName;
  const email = user.email;
  if (email && email.includes("@")) {
    return email.split("@")[0];
  }
  return null;
}
