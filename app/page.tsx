
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

type Conversation = {
  id: string;
  title: string;
  updated_at: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function getErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "message" in err) {
    return String(err.message);
  }
  return String(err);
}

export default function Home() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");

  const loadConversations = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id,title,updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        setError(error.message);
        return;
      }

      setConversations(data || []);
    },
    [supabase]
  );

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data, error } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      setUser(data.user);
      await loadConversations(data.user.id);
    }

    init();

    return () => {
      mounted = false;
    };
  }, [router, supabase, loadConversations]);

  async function openConversation(id: string) {
    setActiveId(id);
    setMessages([]);
    setError("");
    setSidebarOpen(false);

    const { data, error } = await supabase
      .from("messages")
      .select("id,role,content")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
      return;
    }

    setMessages(
      (data || []).filter(
        (m): m is Message =>
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
      )
    );
  }

  function newChat() {
    setActiveId(null);
    setMessages([]);
    setInput("");
    setError("");
    setSidebarOpen(false);
  }

  async function sendMessage() {
    const text = input.trim();

    if (!text || loading || !user) return;

    setInput("");
    setError("");
    setLoading(true);

    let conversationId = activeId;

    try {
      if (!conversationId) {
        const { data, error } = await supabase
          .from("conversations")
          .insert({
            user_id: user.id,
            title: text.slice(0, 60),
          })
          .select("id")
          .single();

        if (error) throw error;

        conversationId = data.id;
        setActiveId(conversationId);
      }

      const temporaryId = crypto.randomUUID();

      setMessages((current) => [
        ...current,
        { id: temporaryId, role: "user", content: text },
      ]);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `Request failed with status ${response.status}`
        );
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.reply,
        },
      ]);

      await loadConversations(user.id);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <main className="relative flex h-[100dvh] overflow-hidden bg-[#080b16] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute -bottom-48 right-0 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[150px]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.04] blur-[120px]" />
      </div>

      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-white/[0.08] bg-[#0b0e19]/95 shadow-2xl backdrop-blur-2xl transition-transform duration-300 md:relative md:z-10 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-gradient-to-br from-blue-500/20 to-violet-600/20 text-xl text-blue-300 shadow-lg shadow-blue-950/30">
              ✦
            </div>
            <div>
              <div className="text-lg font-black tracking-[0.12em]">
                GRAVIX<span className="text-blue-400">.</span>
              </div>
              <div className="text-[9px] font-medium uppercase tracking-[0.25em] text-slate-500">
                Intelligence
              </div>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white md:hidden"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <div className="px-4 pb-5">
          <button
            onClick={newChat}
            className="group flex w-full items-center justify-center gap-2 rounded-xl border border-blue-400/20 bg-gradient-to-r from-blue-600/15 to-violet-600/15 px-4 py-3 text-sm font-medium text-blue-100 shadow-lg shadow-blue-950/10 transition hover:border-blue-400/40 hover:from-blue-600/25 hover:to-violet-600/25"
          >
            <span className="text-lg transition group-hover:rotate-90">＋</span>
            New conversation
          </button>
        </div>

        <div className="px-5 pb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Your workspace
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {conversations.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs leading-6 text-slate-600">
              Your conversations will appear here.
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => openConversation(conversation.id)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                  activeId === conversation.id
                    ? "border border-blue-400/10 bg-blue-500/10 text-white"
                    : "border border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
                }`}
              >
                <span className="shrink-0 text-slate-500">◈</span>
                <span className="truncate">{conversation.title}</span>
              </button>
            ))
          )}
        </div>

        <div className="border-t border-white/[0.08] p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-bold text-white">
              {user?.email?.charAt(0)?.toUpperCase() || "G"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-slate-200">
                Your account
              </div>
              <div className="truncate text-[10px] text-slate-500">
                {user?.email || ""}
              </div>
            </div>
          </div>

          <button
            onClick={signOut}
            className="w-full rounded-xl px-3 py-2.5 text-left text-xs text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
          >
            ↗ Log out
          </button>
        </div>
      </aside>

      {/* Main chat */}
      <section className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#080b16]/60 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.07] md:hidden"
              aria-label="Open chat history"
            >
              ☰
            </button>

            <div>
              <div className="text-sm font-semibold tracking-wide text-white">
                GRAVIX AI
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                Your intelligent workspace
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 sm:flex">
            <span className="text-[10px] text-slate-400">✦</span>
            <span className="text-[10px] font-medium tracking-wide text-slate-400">
              AI ASSISTANT
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center px-5 pb-12 pt-10 text-center">
              <div className="relative mb-7">
                <div className="absolute inset-0 rounded-[30px] bg-blue-500/20 blur-2xl" />
                <div className="relative flex h-[76px] w-[76px] items-center justify-center rounded-[26px] border border-blue-300/20 bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-violet-500/15 text-4xl text-blue-200 shadow-2xl shadow-blue-950/40">
                  ✦
                </div>
              </div>

              <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-blue-300/70">
                Welcome to Gravix
              </div>

              <h1 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
                Think bigger.
                <span className="block bg-gradient-to-r from-blue-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
                  Create without limits.
                </span>
              </h1>

              <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
                Your intelligent workspace for ideas, creativity, coding,
                writing, and problem-solving.
              </p>

              <div className="mt-9 grid w-full max-w-[620px] grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: "⌘",
                    title: "Build something",
                    description: "Create a website or write code",
                    prompt: "Help me build a website",
                  },
                  {
                    icon: "✧",
                    title: "Explore ideas",
                    description: "Brainstorm and discover possibilities",
                    prompt: "Help me brainstorm some creative ideas",
                  },
                  {
                    icon: "◈",
                    title: "Learn something",
                    description: "Understand complex topics simply",
                    prompt: "Explain a difficult topic in simple terms",
                  },
                  {
                    icon: "✎",
                    title: "Create content",
                    description: "Write, edit, and improve your work",
                    prompt: "Help me write something creative",
                  },
                ].map((item) => (
                  <button
                    key={item.title}
                    onClick={() => setInput(item.prompt)}
                    className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-blue-400/25 hover:bg-blue-500/[0.06]"
                  >
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-lg text-blue-300 transition group-hover:border-blue-400/20 group-hover:bg-blue-500/10">
                      {item.icon}
                    </div>
                    <div className="text-sm font-medium text-slate-200">
                      {item.title}
                    </div>
                    <div className="mt-1 text-xs leading-5 text-slate-500">
                      {item.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 sm:gap-4 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold ${
                      message.role === "user"
                        ? "border-violet-400/20 bg-violet-500/10 text-violet-200"
                        : "border-blue-400/20 bg-blue-500/10 text-blue-200"
                    }`}
                  >
                    {message.role === "user" ? "You" : "✦"}
                  </div>

                  <div
                    className={`min-w-0 max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[88%] ${
                      message.role === "user"
                        ? "border border-violet-400/10 bg-violet-500/[0.08] text-slate-100"
                        : "border border-white/[0.06] bg-white/[0.025] text-slate-200"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-3 pl-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-200">
                    ✦
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-xs text-slate-400">
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-300 [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-300 [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-300" />
                    </span>
                    GRAVIX is thinking
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="w-full px-3 pb-3 pt-3 sm:px-6 sm:pb-5">
          <div className="mx-auto max-w-3xl">
            {error && (
              <p className="mb-3 break-words rounded-xl border border-red-400/10 bg-red-500/[0.07] px-4 py-3 text-xs leading-5 text-red-300">
                {error}
              </p>
            )}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
              className="group relative rounded-2xl border border-white/[0.1] bg-[#111625]/90 p-2 shadow-2xl shadow-black/20 backdrop-blur-xl transition focus-within:border-blue-400/30 focus-within:shadow-blue-950/20"
            >
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Message GRAVIX..."
                  rows={1}
                  className="max-h-40 min-h-12 flex-1 resize-y bg-transparent px-3 py-3.5 text-sm leading-6 text-white outline-none placeholder:text-slate-500"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-medium text-white shadow-lg shadow-blue-950/30 transition hover:from-blue-400 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Send message"
                >
                  ↑
                </button>
              </div>
            </form>

            <p className="mt-3 text-center text-[10px] leading-5 text-slate-600">
              GRAVIX AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
