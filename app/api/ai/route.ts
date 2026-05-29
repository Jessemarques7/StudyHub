import Groq, { APIError } from "groq-sdk";
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

const MODEL = process.env.GROQ_MODEL?.trim() || "groq/compound";
const MAX_CONTEXT_MESSAGES = 24;

function isClientMessage(message: unknown): message is ClientMessage {
  if (!message || typeof message !== "object") return false;

  const candidate = message as Record<string, unknown>;
  return (
    (candidate.role === "user" || candidate.role === "assistant") &&
    typeof candidate.content === "string"
  );
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  return new Groq({ apiKey });
}

function getGroqErrorResponse(error: APIError) {
  switch (error.status) {
    case 400:
    case 404:
    case 422:
      return {
        status: 502,
        message:
          "StudyHub AI request was rejected by the AI provider. Please try again with a shorter message.",
      };
    case 401:
    case 403:
      return {
        status: 503,
        message:
          "StudyHub AI is not authorized with the AI provider. Please check the Groq API key.",
      };
    case 408:
      return {
        status: 504,
        message: "StudyHub AI took too long to answer. Please try again.",
      };
    case 429:
      return {
        status: 429,
        message:
          "StudyHub AI is rate limited right now. Please wait a minute and try again.",
      };
    default:
      return {
        status: error.status && error.status >= 500 ? 502 : 503,
        message:
          "StudyHub AI could not reach the AI provider right now. Please try again soon.",
      };
  }
}

export async function POST(request: Request) {
  try {
    let body: AIRequestBody;

    try {
      body = (await request.json()) as AIRequestBody;
    } catch {
      return jsonError("Please send a valid JSON request.", 400);
    }

    const messages = Array.isArray(body.messages)
      ? body.messages
          .filter(isClientMessage)
          .map((message) => ({
            role: message.role,
            content: message.content.trim(),
          }))
          .filter((message) => message.content.length > 0)
          .slice(-MAX_CONTEXT_MESSAGES)
      : [];

    const lastUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user");

    if (!lastUserMessage) {
      return jsonError("Please enter a message for StudyHub AI.", 400);
    }

    const groq = getGroqClient();

    if (!groq) {
      console.error("GROQ_API_KEY is not configured.");
      return jsonError(
        "StudyHub AI is not configured yet. Add GROQ_API_KEY and restart the server.",
        503,
      );
    }

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_MESSAGE },
        ...messages,
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("Groq returned an empty response.");
    }

    return NextResponse.json({ content });
  } catch (error) {
    if (error instanceof APIError) {
      const response = getGroqErrorResponse(error);
      console.error("StudyHub AI provider error:", {
        status: error.status,
        message: error.message,
      });
      return jsonError(response.message, response.status);
    }

    console.error("StudyHub AI route error:", error);
    return jsonError("StudyHub AI could not answer right now.", 500);
  }
}
