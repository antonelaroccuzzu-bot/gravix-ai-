
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          setError(error.message);
        } else if (data.session) {
          router.push("/");
          router.refresh();
        } else {
          setMessage(
            "Account created! Check your inbox for the confirmation email. Open the link to activate your account."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
        } else {
          router.push("/");
          router.refresh();
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07070a] text-white flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="text-3xl font-black tracking-[-0.04em]">
            GRAVIX<span className="text-blue-500">.</span>
          </div>
          <p className="mt-3 text-sm text-zinc-500">
            {mode === "login"
              ? "Welcome back. Continue your AI workspace."
              : "Create your GRAVIX AI account."}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0d0d12] p-6 shadow-2xl">
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-black/40 p-1">
            {(["login", "signup"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item);
                  setError("");
                  setMessage("");
                }}
                className={`rounded-lg py-2.5 text-sm font-medium transition ${
                  mode === item
                    ? "bg-white text-black"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                {item === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="mb-2 block text-xs text-zinc-400">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm outline-none placeholder:text-zinc-700 focus:border-blue-500/60"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs text-zinc-400">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm outline-none placeholder:text-zinc-700 focus:border-blue-500/60"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs text-zinc-400">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm outline-none placeholder:text-zinc-700 focus:border-blue-500/60"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Continue to GRAVIX"
                : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
