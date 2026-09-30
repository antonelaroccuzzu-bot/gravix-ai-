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

  const active = tools.find((tool) => tool.name === activeTool);

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden md:flex w-[260px] shrink-0 flex-col border-r border-white/10 bg-[#0b0b10] p-4">

          {/* LOGO */}
          <div className="flex items-center gap-3 px-3 py-4 mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-xl font-black shadow-lg shadow-blue-500/20">
              G
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight">
                GRAVIX AI
              </div>
              <div className="text-[9px] tracking-[0.25em] text-gray-500">
                AI CREATION PLATFORM
              </div>
            </div>
          </div>

          {/* NEW PROJECT */}
          <button className="mb-6 w-full rounded-xl bg-white py-3 text-sm font-semibold text-black transition hover:bg-gray-200">
            + New Project
          </button>

          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
            Create
          </div>

          {/* TOOLS */}
          <div className="space-y-1">
            {tools.map((tool) => (
              <button
                key={tool.name}
                onClick={() => setActiveTool(tool.name)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                  activeTool === tool.name
                    ? "border border-white/10 bg-white/10"
                    : "hover:bg-white/5"
                }`}
              >
                <span className="text-xl">{tool.icon}</span>

                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    {tool.name}
                  </div>

                  <div className="truncate text-[11px] text-gray-500">
                    {tool.description}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* BOTTOM */}
          <div className="mt-auto">

            <button className="mb-1 w-full rounded-xl p-3 text-left text-sm text-gray-300 transition hover:bg-white/5">
              📁 Projects
            </button>

            <button className="mb-4 w-full rounded-xl p-3 text-left text-sm text-gray-300 transition hover:bg-white/5">
              ⚙️ Settings
            </button>

            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center gap-3 px-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 font-bold">
                  G
                </div>

                <div>
                  <div className="text-sm font-medium">
                    My Account
                  </div>

                  <div className="text-xs text-gray-500">
                    Free Plan
                  </div>
                </div>
              </div>
            </div>

          </div>
        </aside>

        {/* MAIN */}
        <section className="min-w-0 flex-1">

          {/* TOP BAR */}
          <header className="flex h-16 items-center justify-between border-b border-white/10 px-5 md:px-8">

            <div className="flex items-center gap-3 md:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 font-black">
                G
              </div>

              <span className="font-bold">
                GRAVIX AI
              </span>
            </div>

            <div className="hidden text-sm text-gray-500 md:block">
              Workspace{" "}
              <span className="mx-2">/</span>
              <span className="text-white">
                {activeTool}
              </span>
            </div>

            <div className="ml-auto flex items-center gap-2">

              <div className="hidden rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400 sm:block">
                ⚡ 1,000 credits
              </div>

              <button className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-200">
                Upgrade
              </button>

            </div>
          </header>

          {/* CONTENT */}
          <div className="mx-auto max-w-5xl px-5 py-12 md:px-10">

            {/* HERO */}
            <div className="mb-12 text-center">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400">
                <span>✦</span>
                <span>GRAVIX AI</span>
              </div>

              <h1 className="text-4xl font-black tracking-tight md:text-6xl">
                What will you
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  create today?
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-500 md:text-base">
                One powerful AI workspace for chat, code, websites,
                images, videos, writing and intelligent automation.
              </p>

            </div>

            {/* TOOL CARDS */}
            <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">

              {tools.slice(0, 4).map((tool) => (
                <button
                  key={tool.name}
                  onClick={() => setActiveTool(tool.name)}
                  className={`rounded-2xl border p-5 text-left transition duration-200 hover:-translate-y-1 ${
                    activeTool === tool.name
                      ? "border-blue-500/40 bg-blue-500/10"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >

                  <div className="mb-3 text-2xl">
                    {tool.icon}
                  </div>

                  <div className="text-sm font-semibold">
                    {tool.name}
                  </div>

                  <div className="mt-1 text-xs text-gray-500">
                    {tool.description}
                  </div>

                </button>
              ))}

            </div>

            {/* AI PROMPT */}
            <div className="rounded-3xl border border-white/10 bg-[#0d0d12] p-3 shadow-2xl shadow-black/30">

              <div className="px-4 pt-3 text-xs text-gray-500">
                {active?.icon} {activeTool}
              </div>

              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={
                  activeTool === "AI Chat"
                    ? "Ask GRAVIX anything..."
                    : `Tell GRAVIX what you want to create with ${activeTool}...`
                }
                className="min-h-[150px] w-full resize-none bg-transparent p-4 text-sm text-white outline-none placeholder:text-gray-600"
              />

              <div className="flex items-center justify-between px-2 pb-2">

                <div className="flex gap-2">
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-lg transition hover:bg-white/10">
                    +
                  </button>

                  <button className="rounded-lg bg-white/5 px-3 text-xs text-gray-400 transition hover:bg-white/10">
                    ⚡ Auto
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (!prompt.trim()) return;
                    alert(
                      "GRAVIX AI is ready. The real AI engine will be connected next."
                    );
                  }}
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
                >
                  Create →
                </button>

              </div>
            </div>

            {/* RECENT PROJECTS */}
            <div className="mt-12">

              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">
                  Recent Projects
                </h2>

                <button className="text-xs text-gray-500 transition hover:text-white">
                  View all
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">

                {[
                  ["✨", "Untitled Project"],
                  ["🌐", "AI Website"],
                  ["🚀", "New Creation"],
                ].map(([icon, name]) => (
                  <div
                    key={name}
                    className="cursor-pointer rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.06]"
                  >

                    <div className="mb-3 flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] text-2xl">
                      {icon}
                    </div>

                    <div className="text-sm font-medium">
                      {name}
                    </div>

                    <div className="mt-1 text-xs text-gray-600">
                      Just now
                    </div>

                  </div>
                ))}

              </div>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}