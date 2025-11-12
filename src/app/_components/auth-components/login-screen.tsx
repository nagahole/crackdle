"use client";
import { supabaseBrowser } from "@/lib/supabase-client";
import { Logo } from "../logo";
import { Subtitle } from "../subtitle";
import { useState } from "react";

interface LoginScreenProps {
  setSignUp: (value: boolean) => void;
}

export function LoginScreen({ setSignUp }: LoginScreenProps) {
  const supabase = supabaseBrowser;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignInGithub = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: `${window.location.origin}` },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in with GitHub");
      setLoading(false);
    }
  };

  const handleSignInGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}` },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in with Google");
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
      setLoading(false);
    }
  };

  const handleSwitchToSignUp = () => setSignUp(true);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Top: logo + slogan */}
        <header className="flex flex-col items-center gap-2 mb-15">
          <div className="w-full flex items-center justify-center pt-6">
            <Logo />
          </div>
          <div className="text-center">
            <Subtitle />
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className="mb-4 text-sm text-red-300 border border-red-600/30 bg-red-600/6 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignIn} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="email@domain.com"
            className="w-full rounded-md px-3 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-500
                       focus:outline-none focus:ring-1 focus:ring-emerald-400/70 focus:border-emerald-400 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <input
            type="password"
            placeholder="••••••••"
            className="w-full rounded-md px-3 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-500
                       focus:outline-none focus:ring-1 focus:ring-emerald-400/70 focus:border-emerald-400 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md py-3 bg-emerald-400 text-black font-semibold shadow-sm
                       hover:shadow-[0_6px_18px_rgba(16,185,129,0.12)] transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* Signup link */}
        <div className="mt-4 text-center ">
          <button
            onClick={handleSwitchToSignUp}
            disabled={loading}
            className="text-sm text-zinc-300  transition underline-offset-2"
          >
            Don&apos;t have an account?{" "}
            <span className="hover:text-emerald-400 text-zinc-300 underline">Sign up</span>
          </button>
        </div>

        {/* Divider */}
        <div className="mt-6 mb-3 flex items-center gap-3 text-xs text-zinc-500">
          <div className="flex-1 border-t border-zinc-800"></div>
          <div>or continue with</div>
          <div className="flex-1 border-t border-zinc-800"></div>
        </div>

        {/* OAuth buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSignInGithub}
            disabled={loading}
            className="w-full flex items-center gap-3 justify-center rounded-md py-3 bg-zinc-900 border border-zinc-800
                       hover:border-emerald-400 hover:text-emerald-400 transition disabled:opacity-50"
            aria-label="Continue with GitHub"
          >
            {/* GitHub SVG (simple mark) */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-300">
              <path d="M12 .5C5.7.5.8 5.4.8 11.7c0 4.8 3.1 8.9 7.4 10.3.6.1.8-.3.8-.6v-2.1c-3 .6-3.6-1.2-3.6-1.2-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1 1.6.9 1.6.9.9 1.6 2.4 1.2 3 .9.1-.7.4-1.2.7-1.5-2.4-.3-4.9-1.2-4.9-5.3 0-1.1.4-2.1 1-2.9-.1-.3-.4-1.5.1-3.1 0 0 .9-.3 3 .9.9-.3 1.9-.4 2.9-.4 1 0 2 .1 2.9.4 2.1-1.2 3-.9 3-.9.5 1.6.2 2.8.1 3.1.6.8 1 1.8 1 2.9 0 4.1-2.5 5-4.9 5.3.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6 4.3-1.4 7.4-5.5 7.4-10.3C23.2 5.4 18.3.5 12 .5z" />
            </svg>

            <span className="text-sm font-semibold">Continue with GitHub</span>
          </button>

          <button
            onClick={handleSignInGoogle}
            disabled={loading}
            className="w-full flex items-center gap-3 justify-center rounded-md py-3 bg-zinc-900 border border-zinc-800
                       hover:border-emerald-400 hover:text-emerald-400 transition disabled:opacity-50"
            aria-label="Continue with Google"
          >
            {/* Google "G" mark (simple) */}
            <svg width="18" height="18" viewBox="0 0 48 48" className="text-zinc-300">
              <path fill="#EA4335" d="M24 9.5c3.9 0 7 1.3 9.1 3.1l6.7-6.7C36 2 30.4 0 24 0 14.6 0 6.7 4.8 2.6 11.8l7.8 6.1C12.6 12.1 17.6 9.5 24 9.5z"/>
              <path fill="#34A853" d="M46.4 24.5c0-1.4-.1-2.5-.4-3.6H24v7h12.6c-.6 3.2-2.6 5.6-5.6 7.3l8.6 6.6C44.7 36.7 46.4 31 46.4 24.5z"/>
              <path fill="#4A90E2" d="M10.4 30.6c-.8-2.3-1.3-4.7-1.3-7.1s.5-4.8 1.3-7.1L2.6 10.3C.9 14.5 0 19 0 24s.9 9.5 2.6 13.7l7.8-7.1z"/>
              <path fill="#FBBC05" d="M24 48c6.4 0 12-2 16.4-5.4l-8.6-6.6C29.9 36.8 27 38 24 38c-7.4 0-12.4-4-14.6-9.7l-7.8 6.1C6.7 43.2 14.6 48 24 48z"/>
            </svg>

            <span className="text-sm font-semibold">Continue with Google</span>
          </button>
        </div>

        {/* small footer spacing */}
        <div className="mt-6 text-xs text-zinc-600 text-center">
          <span>By continuing you agree to our terms.</span>
        </div>
      </div>
    </main>
  );
}
