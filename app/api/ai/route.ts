import Groq from "groq-sdk";
import { NextResponse } from "next/server";

type ClientMessage = {
  role: "user" | "assistant";
  content: string;
};

type AIRequestBody = {
  messages?: ClientMessage[];
};

const SYSTEM_MESSAGE =
  "You are StudyHub AI, an intelligent assistant inside a student productivity and note-taking app. Help the user study, organize notes, summarize content, create study plans, explain concepts clearly, generate flashcards, improve writing, and answer questions. Be concise, practical, and structured. When helpful, use headings, bullets, examples, and step-by-step explanations.";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function isClientMessage(message: unknown): message is ClientMessage {
  if (!message || typeof message !== "object") return false;

  const candidate = message as Record<string, unknown>;
  return (
    (candidate.role === "user" || candidate.role === "assistant") &&
    typeof candidate.content === "string"
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AIRequestBody;
    const messages = Array.isArray(body.messages)
      ? body.messages.filter(isClientMessage)
      : [];

    const lastUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user");

    if (!lastUserMessage?.content.trim()) {
      return NextResponse.json(
        { error: "Please enter a message for StudyHub AI." },
        { status: 400 },
      );
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not configured.");
      return NextResponse.json(
        { error: "StudyHub AI is not configured yet." },
        { status: 500 },
      );
    }

    const completion = await groq.chat.completions.create({
      model: "groq/compound",
      messages: [
        { role: "system", content: SYSTEM_MESSAGE },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content.trim(),
        })),
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("Groq returned an empty response.");
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("StudyHub AI route error:", error);
    return NextResponse.json(
      { error: "StudyHub AI could not answer right now." },
      { status: 500 },
    );
  }
}
