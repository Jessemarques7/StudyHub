"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Loader2, Mic, Paperclip, RotateCcw, Send } from "lucide-react";

import { NetworkSphere } from "@/components/ui/NetworkSphere";
import { cn } from "@/lib/utils";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

function createMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
  };
}

export default function HomePage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = input.trim().length > 0 && !isLoading;
  const hasMessages = messages.length > 0;

  async function sendMessage(prompt?: string) {
    const content = (prompt ?? input).trim();
    if (!content || isLoading) return;

    const userMessage = createMessage("user", content);
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        content?: string;
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(data?.error || "StudyHub AI could not respond.");
      }

      if (!data?.content) {
        throw new Error("StudyHub AI returned an empty response.");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage("assistant", data.content ?? ""),
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong while asking StudyHub AI.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-[#030811] px-4 pb-8 pt-8 text-font selection:bg-complement/25 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(66,153,225,0.14),transparent_34%),radial-gradient(circle_at_80%_80%,rgba(70,80,190,0.12),transparent_35%),linear-gradient(180deg,#030811_0%,#050711_100%)]" />
      <div className="absolute inset-0 opacity-[0.055] [background-image:radial-gradient(circle,rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,8,17,0.1)_38%,rgba(3,8,17,0.88)_78%)]" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-75">
        <NetworkSphere
          size="clamp(34rem, 72vw, 56rem)"
          className="[mask-image:radial-gradient(circle_at_center,black_40%,transparent_74%)]"
        />
      </div>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-5xl flex-col items-center justify-center gap-5">
        <section className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">
            StudyHub AI
          </p>
        </section>

        {hasMessages && (
          <section
            aria-label="StudyHub AI conversation"
            className="max-h-[min(42vh,26rem)] w-full max-w-3xl overflow-y-auto     p-4  "
          >
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[86%] whitespace-pre-wrap rounded-lg px-4 py-3 text-sm leading-6 shadow-lg",
                      message.role === "user"
                        ? "border border-complement/10 backdrop-blur-xl bg-complement/10 text-white/80"
                        : "border border-white/10 bg-secondary/10 text-white/80 backdrop-blur-xl",
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.055] px-4 py-3 text-sm text-white/60 backdrop-blur-xl">
                    <Loader2 className="h-4 w-4 animate-spin text-complement" />
                    Thinking
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {error && (
          <div className="w-full max-w-3xl rounded-md border border-red-300/20 bg-red-500/10 px-3 py-2 text-sm text-red-100 backdrop-blur-xl">
            {error}
          </div>
        )}

        <form
          className="w-full max-w-3xl"
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage();
          }}
        >
          <div className="relative overflow-hidden rounded-full border border-third/10 bg shadow-[0_18px_60px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl transition focus-within:border-complement/50">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.06),transparent_28%,rgba(66,153,225,0.08)_100%)]" />
            <div className="relative flex items-end gap-2 py-1 px-2">
              <button
                type="button"
                aria-label="Attach file"
                className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-white/55 transition hover:bg-white/[0.08] hover:text-white focus:outline-none focus:ring-2 focus:ring-complement/30"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="How can I help?"
                rows={1}
                className="max-h-32 min-h-12 flex-1 resize-none bg-transparent px-1 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/50"
              />

              <button
                type="button"
                aria-label="Voice input"
                className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-white/55 transition hover:bg-white/[0.08] hover:text-white focus:outline-none focus:ring-2 focus:ring-complement/30"
              >
                <Mic className="h-4 w-4" />
              </button>

              <button
                type="submit"
                disabled={!canSend}
                aria-label="Send message"
                className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-complement text-[#030811] shadow-[0_0_24px_rgba(66,153,225,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30 disabled:shadow-none"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </form>

        {hasMessages && (
          <button
            type="button"
            onClick={() => {
              setMessages([]);
              setInput("");
              setError(null);
              textareaRef.current?.focus();
            }}
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-white/45 transition hover:bg-white/5 hover:text-white/75"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New chat
          </button>
        )}
      </main>
    </div>
  );
}
