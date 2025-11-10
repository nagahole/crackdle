// src/app/_components/auth-gate.tsx
"use client";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabaseClient";

export function FindGameScreen({ user }: { user: User; }) {

    const supabase = supabaseBrowser;

    return (
        <main className="flex bg-black min-h-screen flex-col items-center justify-center gap-4">
            <div className="text-sm text-gray-500">
                Logged in as {user.email ?? user.id}
            </div>
            <h2 className="text-2xl text-white font-semibold">Find a game</h2>
            <button className="rounded bg-blue-600 px-4 py-2 text-white">
                Quick Match
            </button>
            {/* logout button */}
            <button
                className="rounded bg-red-600 px-4 py-2 text-white"
                onClick={async () => await supabase.auth.signOut()}
            >
                Logout
            </button>
        </main>
    );
}
