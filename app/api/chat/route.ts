import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Please log in first." },
        { status: 401 }
      );
    }
    const body = await request.json();
    const message = body?.message;
    let conversationId = body?.conversationId;
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "AI service is not configured." },
        { status: 500 }
      );
    }
    if (conversationId) {
      const { data: conversation, error } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("user_id", user.id)
        .single();
      if (error || !conversation) {
        return NextResponse.json(
          { error: "Conversation not found." },
          { status: 404 }
        );
      }
    } else {
      const { data: conversation, error } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title: message.trim().slice(0, 60),
        })
        .select("id")
        .single();
      if (error || !conversation) {
        throw new Error("Could not create conversation.");
      }
      conversationId = conversation.id;
    }
    const { error: saveUserError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: "user",
        content: message.trim(),
      });
    if (saveUserError) throw saveUserError;
    const { data: history, error: historyError } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(30);
    if (historyError) throw historyError;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const response = await openai.responses.create({
      model: "gpt-5",
      instructions:
        "You are GRAVIX AI, a helpful, intelligent AI assistant. Give clear, useful and accurate answers.",
      input: (history || []).map((item) => ({
        role: item.role as "user" | "assistant",
        content: item.content,
      })),
    });
    const reply = response.output_text;
    const { error: saveReplyError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: "assistant",
        content: reply,
      });
    if (saveReplyError) throw saveReplyError;
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId)
      .eq("user_id", user.id);
    return NextResponse.json({
      reply,
      conversationId,
    });
  } catch (error: unknown) {
    console.error("GRAVIX AI error:", error);
    const message =
      error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}