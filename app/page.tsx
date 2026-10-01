
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

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");

  const loadConversations = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("conversations")
      .select("id,title,updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (!error) setConversations(data || []);
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!data.user) {
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

    setMessages((data || []).filter(
      (m): m is Message =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    ));
  }

  async function newChat() {
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
        throw new Error(result.error || "Something went wrong.");
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
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send message."
      );
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
    <main className="flex h-[100dvh] overflow-hidden bg-[#09090d] text-white">
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[280px] flex-col border-r border-white/10 bg-[#101015] transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <div className="text-xl font-black tracking-tight">
            GRAVIX<span className="text-blue-500">.</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg px-2 py-1 text-zinc-400 md:hidden"
          >
            ✕
          </button>
        </div>

        <button
          onClick={newChat}
          className="mx-3 mb-5 rounded-xl border border-white/10 px-4 py-3 text-left text-sm hover:bg-white/5"
        >
          + New chat
        </button>

        <div className="px-4 pb-2 text-xs font-medium text-zinc-500">
          Recent chats
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto px-2">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => openConversation(conversation.id)}
              className={`w-full truncate rounded-lg px-3 py-3 text-left text-sm ${
                activeId === conversation.id
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {conversation.title}
            </button>
          ))}
        </div>

        <div className="border-t border-white/10 p-3">
          <div className="mb-3 truncate px-2 text-xs text-zinc-500">
            {user?.email || "Your account"}
          </div>
          <button
            onClick={signOut}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            Log out
          </button>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg px-2 py-1 text-zinc-300 md:hidden"
              aria-label="Open chat history"
            >
              ☰
            </button>
            <span className="text-sm font-medium">GRAVIX AI</span>
            <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-zinc-400">
              AI assistant
            </span>
          </div>
          <div className="text-xs text-zinc-500">Workspace</div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center px-5 pb-10 text-center">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl">
                ✦
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                What can I help you with?
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-zinc-500">
                Ask GRAVIX to explain, write, code, research, plan, or create.
              </p>
              <div className="mt-7 flex max-w-lg flex-wrap justify-center gap-2">
                {[
                  "Help me build a website",
                  "Write something for me",
                  "Explain a difficult topic",
                  "Help me write code",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="rounded-full border border-white/10 px-3 py-2 text-xs text-zinc-400 hover:bg-white/5 hover:text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-7 px-4 py-8">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs">
                    {message.role === "user" ? "You" : "✦"}
                  </div>
                  <div className="min-w-0 flex-1 whitespace-pre-wrap break-words pt-1 text-sm leading-7 text-zinc-200">
                    {message.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="pl-11 text-sm text-zinc-500">
                  GRAVIX is thinking...
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-full px-3 pb-3 pt-2 sm:px-5">
          <div className="mx-auto max-w-3xl">
            {error && (
              <p className="mb-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </p>
            )}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
              className="flex items-end gap-2 rounded-2xl border border-white/10 bg-[#15151b] p-2 shadow-xl"
            >
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
                className="max-h-40 min-h-11 flex-1 resize-y bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-black disabled:opacity-30"
                aria-label="Send message"
              >
                ↑
              </button>
            </form>
            <p className="mt-2 text-center text-[10px] text-zinc-600">
              GRAVIX can make mistakes. Check important information.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
