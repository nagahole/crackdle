"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase-client";

import { LoginScreen } from "./login-screen";
import { FindGameScreen } from "./find-game-screen";

export function AuthGate() {
  const supabase = supabaseBrowser;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (loading) return <div>Loading…</div>;
  if (!user) return <LoginScreen />;

  return <FindGameScreen user={user} />;
}