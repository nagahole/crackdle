// src/app/_components/auth-gate.tsx
"use client";
import { supabaseBrowser } from "@/lib/supabase-client";
import { Logo } from "./logo";
import { Subtitle } from "./subtitle";

export function LoginScreen() {
    const supabase = supabaseBrowser;

    const handleSignInGithub = async () => {
        await supabase.auth.signInWithOAuth({ provider: "github" });
    };

    const handleSignInGoogle = async () => {
        await supabase.auth.signInWithOAuth({ provider: "google" });
    };

    return (
        <main className="flex bg-black min-h-screen flex-col items-center justify-center gap-4">
            <Logo/>
            <Subtitle/>
            <p className="text-sm text-white">
                Log in to play 1v1 decryption races.
            </p>
            <button
                onClick={handleSignInGithub}
                className="rounded bg-purple-600 px-4 py-2 text-white"
            >
                Continue with GitHub
            </button>
            <button
                onClick={handleSignInGoogle}
                className="rounded bg-blue-600 px-4 py-2 text-white"
            >
                Continue with Google
            </button>
        </main>
    );
}
