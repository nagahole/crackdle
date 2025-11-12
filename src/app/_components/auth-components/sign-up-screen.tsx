"use client";
import { supabaseBrowser } from "@/lib/supabase-client";
import { Logo } from "../logo";
import { Subtitle } from "../subtitle";
import { useState } from "react";

interface SignUpScreenProps {
  setSignUp?: (value: boolean) => void;
}

export function SignUpScreen({ setSignUp }: SignUpScreenProps) {
  const supabase = supabaseBrowser;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}`,
        },
      });

      if (error) throw error;

      setSuccess(true);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    if (setSignUp) {
      setSignUp(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Top: logo + slogan */}
          <header className="flex flex-col items-center gap-2 mb-8">
            <div className="w-full flex items-center justify-center pt-6">
              <Logo />
            </div>
            <div className="text-center">
              <Subtitle />
            </div>
          </header>

          <div className="bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 px-6 py-6 rounded text-center max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-2">Check your email</h2>
            <p className="text-sm text-zinc-200">
              We&apos;ve sent a confirmation link. Please check your email and click the link to verify your account.
            </p>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={handleSwitchToLogin}
              className="text-sm text-zinc-300 hover:text-emerald-400 transition underline-offset-2"
            >
              Back to login
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Top: logo + slogan */}
        <header className="flex flex-col items-center gap-2 mb-8">
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
        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
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
            placeholder="Password"
            className="w-full rounded-md px-3 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-500
                       focus:outline-none focus:ring-1 focus:ring-emerald-400/70 focus:border-emerald-400 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full rounded-md px-3 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-500
                       focus:outline-none focus:ring-1 focus:ring-emerald-400/70 focus:border-emerald-400 transition"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md py-3 bg-emerald-400 text-black font-semibold shadow-sm
                       hover:shadow-[0_6px_18px_rgba(16,185,129,0.12)] transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* Switch to login */}
        <div className="mt-4 text-center">
          <button
            onClick={handleSwitchToLogin}
            disabled={loading}
            className="text-sm text-zinc-300   transition underline-offset-2"
          >
            Already have an account?{" "}
            <span className="text-zinc-300 hover:text-emerald-400 underline">Login</span>
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
