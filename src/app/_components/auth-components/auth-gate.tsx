"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase-client";

import { LoginScreen } from "./login-screen";
import { Home } from "../home";
import { LoadingScreen } from "../loading-screen";
import { SignUpScreen } from "./sign-up-screen";

// gates access on landing page based on supabase authentication state
export function AuthGate() {
  const supabase = supabaseBrowser;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signUp, setSignUp] = useState(false);

  useEffect(() => {
    // initial fetch of user authentication
    void supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error("Error getting user:", error);
      }
      setUser(data.user ?? null);
      setLoading(false);
    });

    // subscribe to supabase events to update accordingly based on any authentication changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // If user signs in, switch back to login view (in case they were on sign up)
      if (event === "SIGNED_IN" && session?.user) {
        setSignUp(false);
      }
    });

    // cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (loading) return <LoadingScreen/>;
  if (!user && !signUp) return <LoginScreen setSignUp={setSignUp} />;
  if (!user && signUp) return <SignUpScreen setSignUp={setSignUp} />;

  if (!user) return <LoadingScreen/>; // Safety check
  
  return <Home user={user} />;
}