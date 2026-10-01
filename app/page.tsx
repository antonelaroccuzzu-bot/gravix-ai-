"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  async function handleCreate() {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setReply("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: prompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setReply(data.reply);
    } catch (error) {
      setReply(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function useSuggestion(text: string) {
    setPrompt(text);
  }

  return (
    <main className="min-h-screen bg-[#08090b] text-white">
      {/* Top navigation */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.06] bg-[#08090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-black text-black">
              G
            </div>

            <div>
              <div className="text-sm font-semibold tracking-tight">
                GRAVIX AI
              </div>
              <div className="text-[10px] tracking-[0.18em] text-white/35">
                INTELLIGENCE PLATFORM
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="hidden rounded-lg px-3 py-2 text-sm text-white/55 transition hover:bg-white/[0.06] hover:text-white sm:block">
              Projects
            </button>

            <button
              onClick={() => setShowAccount(!showAccount)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sm font-semibold transition hover:bg-white/10"
            >
              G
            </button>
          </div>
        </div>
      </header>

      {/* Account popup */}
      {showAccount && (
        <div className="fixed right-4 top-[72px] z-50 w-64 rounded-2xl border border-white/10 bg-[#111216] p-4 shadow-2xl">
          <div className="mb-4">
            <p className="text-sm font-semibold">My Account</p>
            <p className="mt-1 text-xs text-white/40">
              Free Plan
            </p>
          </div>

          <button className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90">
            Upgrade to Pro
          </button>
        </div>
      )}

      {/* Main workspace */}
      <section className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 pb-8 pt-28 sm:px-6">
        {/* Hero */}
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-2xl shadow-2xl">
            ✦
          </div>

          <h1 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">
            What can I help you create?
          </h1>

          <p className="mt-4 max-w-xl text-center text-sm leading-6 text-white/40 sm:text-base">
            Ask GRAVIX to write, build, design, code, research,
            create or edit. Just describe what you want.
          </p>

          {/* Suggestions */}
          <div className="mt-8 flex max-w-2xl flex-wrap justify-center gap-2">
            {[
              "Build me a website",
              "Create an app",
              "Write something for me",
              "Create an image",
            ].map((item) => (
              <button
                key={item}
                onClick={() => useSuggestion(item)}
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/55 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Response */}
          {reply && (
            <div className="mt-10 w-full max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium text-white/40">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-black">
                  G
                </span>
                GRAVIX
              </div>

              <div className="whitespace-pre-wrap text-sm leading-7 text-white/85">
                {reply}
              </div>
            </div>
          )}

          {/* Composer */}
          <div className="mt-10 w-full max-w-3xl">
            <div className="rounded-3xl border border-white/10 bg-[#111216] p-3 shadow-2xl shadow-black/30 transition focus-within:border-white/20">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCreate();
                  }
                }}
                placeholder="Ask GRAVIX anything..."
                rows={3}
                className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-white/25"
              />

              <div className="flex items-center justify-between px-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-white/25">
                  <span>GRAVIX AI</span>
                  <span>•</span>
                  <span>Auto</span>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={!prompt.trim() || loading}
                  className="flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {loading ? "Thinking..." : "Create"}
                  {!loading && <span>↑</span>}
                </button>
              </div>
            </div>

            <p className="mt-3 text-center text-[11px] text-white/20">
              GRAVIX can make mistakes. Check important information.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}