"use client";

import { useState } from "react";

const tools = [
  { icon: "🤖", name: "AI Chat", description: "Chat with powerful AI" },
  { icon: "💻", name: "Code Builder", description: "Build apps with AI" },
  { icon: "🌐", name: "Website Builder", description: "Create websites" },
  { icon: "🎨", name: "Image Creator", description: "Generate images" },
  { icon: "🎬", name: "Video Creator", description: "Create videos" },
  { icon: "✍️", name: "Writing", description: "Write anything" },
  { icon: "🧠", name: "AI Agents", description: "Automate tasks" },
];

export default function Home() {
  const [activeTool, setActiveTool] = useState("AI Chat");
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const active = tools.find((tool) => tool.name === activeTool);

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

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden md:flex w-[260px] shrink-0 flex-col border-r border-white/10 bg-[#0b0b10] p-4">
          <div className="flex items-center gap-3 px-3 py-4 mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-xl font-black">
              G
            </div>
            <div>
              <div className="text-lg font-bold">GRAVIX AI</div>
              <div className="text-[9px] tracking-[0.25em] text-gray-500">
                AI CREATION PLATFORM
              </div>
            </div>
          </div>

          <button className="mb-6 w-full rounded-xl bg-white py-3 text-sm font-semibold text-black">
            + New Project
          </button>

          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
            Create
          </div>

          <div className="space-y-1">
            {tools.map((tool) => (
              <button
                key={tool.name}
                onClick={() => setActiveTool(tool.name)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left ${
                  activeTool === tool.name
                    ? "border border-white/10 bg-white/10"
                    : "hover:bg-white/5"
                }`}
              >
                <span className="text-xl">{tool.icon}</span>
                <div>
                  <div className="text-sm font-medium">{tool.name}</div>
                  <div className="text-[11px] text-gray-500">
                    {tool.description}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-auto">
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center gap-3 px-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 font-bold">
                  G
                </div>
                <div>
                  <div className="text-sm font-medium">My Account</div>
                  <div className="text-xs text-gray-500">Free Plan</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-16 items-center justify-between border-b border-white/10 px-5 md:px-8">
            <div className="flex items-center gap-3 md:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 font-black">
                G
              </div>
              <span className="font-bold">GRAVIX AI</span>
            </div>

            <div className="hidden text-sm text-gray-500 md:block">
              Workspace /{" "}
              <span className="text-white">{activeTool}</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="hidden rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400 sm:block">
                ⚡ 1,000 credits
              </div>

              <button className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black">
                Upgrade
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-5xl px-5 py-12 md:px-10">
            <div className="mb-12 text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400">
                ✦ GRAVIX AI
              </div>

              <h1 className="text-4xl font-black tracking-tight md:text-6xl">
                What will you
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  create today?
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-500 md:text-base">
                One powerful AI workspace for chat, code, websites, images,
                videos, writing and intelligent automation.
              </p>
            </div>

            <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
              {tools.slice(0, 4).map((tool) => (
                <button
                  key={tool.name}
                  onClick={() => setActiveTool(tool.name)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    activeTool === tool.name
                      ? "border-blue-500/40 bg-blue-500/10"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <div className="mb-3 text-2xl">{tool.icon}</div>
                  <div className="text-sm font-semibold">{tool.name}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {tool.description}
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0d0d12] p-3 shadow-2xl">
              <div className="px-4 pt-3 text-xs text-gray-500">
                {active?.icon} {activeTool}
              </div>

              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleCreate();
                  }
                }}
                placeholder="Ask GRAVIX anything..."
                className="min-h-[150px] w-full resize-none bg-transparent p-4 text-sm text-white outline-none placeholder:text-gray-600"
              />

              <div className="flex items-center justify-between px-2 pb-2">
                <div className="flex gap-2">
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-lg">
                    +
                  </button>

                  <button className="rounded-lg bg-white/5 px-3 text-xs text-gray-400">
                    ⚡ Auto
                  </button>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
                >
                  {loading ? "Thinking..." : "Create →"}
                </button>
              </div>
            </div>

            {reply && (
              <div className="mt-6 rounded-3xl border border-white/10 bg-[#0d0d12] p-6">
                <div className="mb-3 text-sm font-semibold text-gray-400">
                  🤖 GRAVIX AI
                </div>

                <div className="whitespace-pre-wrap text-sm leading-7 text-gray-200">
                  {reply}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
