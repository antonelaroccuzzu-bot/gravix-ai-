import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body?.message;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is missing in the deployment." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey,
    });

    const response = await openai.responses.create({
      model: "gpt-5",
      instructions:
        "You are GRAVIX AI, a helpful, intelligent AI assistant. Give clear, useful answers.",
      input: message,
    });

    return NextResponse.json({
      reply: response.output_text,
    });
  } catch (error: unknown) {
    console.error("GRAVIX AI error:", error);

    const message =
      error instanceof Error ? error.message : "Unknown OpenAI error.";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}