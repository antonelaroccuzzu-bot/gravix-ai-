import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured." },
        { status: 500 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-5",
      instructions:
        "You are GRAVIX AI, a helpful, intelligent AI assistant. Give clear, useful answers.",
      input: message,
    });

    return NextResponse.json({
      reply: response.output_text,
    });
  } catch (error) {
    console.error("GRAVIX AI error:", error);

    return NextResponse.json(
      { error: "Something went wrong while contacting GRAVIX AI." },
      { status: 500 }
    );
  }
}