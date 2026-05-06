"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  CalendarCheck,
  ChevronDown,
  FileText,
  Loader2,
  Mic,
  Plus,
  Search,
  Send,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type Suggestion = {
  label: string;
  prompt: string;
  icon: LucideIcon;
};

const suggestions: Suggestion[] = [
  {
    label: "Search for anything",
    prompt: "Help me search or understand something from my study materials.",
    icon: Search,
  },
  {
    label: "Summarize my notes",
    prompt: "Summarize these notes clearly and organize the key points.",
    icon: FileText,
  },
  {
    label: "Create a study plan",
    prompt: "Create a study plan for me based on my goals.",
    icon: CalendarCheck,
  },
  {
    label: "Explain this topic",
    prompt: "Explain this topic in a simple and clear way.",
    icon: Sparkles,
  },
];

function createMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
  };
}

export default function StudyHubAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = input.trim().length > 0 && !isLoading;

  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 80);

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

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

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Open StudyHub AI"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 sm:bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-complement/35 bg-main text-font shadow-2xl shadow-black/40 transition hover:-translate-y-0.5 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-complement/40 md:bottom-6 md:right-6"
      >
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full p-1.5 text-font">
          <Image
            src="/logo.png"
            alt=""
            width={28}
            height={28}
            className="h-full w-full object-contain"
          />
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-x-3 bottom-24 z-[70] md:inset-x-auto md:bottom-6 md:right-6">
          <section
            aria-label="StudyHub AI chat"
            className="ml-auto flex h-[min(640px,calc(100vh-7rem))] w-full max-w-[560px] flex-col overflow-hidden rounded-[28px] border border-font/10 bg-main text-font shadow-2xl shadow-black/50 md:h-[610px] md:w-[560px]"
          >
            <header className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-font">
                  New AI chat
                </h2>
                <ChevronDown className="h-4 w-4 text-font/50" />
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="New chat"
                  onClick={() => {
                    setMessages([]);
                    setInput("");
                    setError(null);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-font/70 transition hover:bg-secondary hover:text-font focus:outline-none focus:ring-2 focus:ring-complement/30"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Close StudyHub AI"
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-font/70 transition hover:bg-secondary hover:text-font focus:outline-none focus:ring-2 focus:ring-complement/30"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-5 pb-4 pt-6 sm:px-8">
              {messages.length === 0 ? (
                <div className="flex min-h-full flex-col justify-center">
                  <div className="mb-6">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-complement/25 bg-secondary p-2.5 text-font shadow-card">
                      <Image
                        src="/logo.png"
                        alt="StudyHub"
                        width={48}
                        height={48}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <p className="text-xl font-semibold tracking-tight text-font sm:text-2xl">
                      How can I help you today?
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    {suggestions.map((suggestion) => {
                      const Icon = suggestion.icon;

                      return (
                        <button
                          key={suggestion.label}
                          type="button"
                          onClick={() => void sendMessage(suggestion.prompt)}
                          disabled={isLoading}
                          className="flex min-h-10 w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-base font-medium text-font transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Icon className="h-5 w-5 shrink-0 text-complement" />
                          <span>{suggestion.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[86%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                          message.role === "user"
                            ? "bg-complement text-main"
                            : "bg-secondary text-font"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2 rounded-2xl border border-font/10 bg-secondary px-4 py-3 text-sm text-font/65">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Thinking...
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="mx-5 mb-3 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-100 sm:mx-8">
                {error}
              </div>
            )}

            <form
              className="p-4 sm:px-5 sm:pb-5"
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage();
              }}
            >
              <div className="rounded-[22px] border border-font/10 bg-third p-3 shadow-inner shadow-black/20 focus-within:border-complement/35">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Do anything with AI..."
                  rows={3}
                  className="max-h-32 min-h-16 w-full resize-none bg-transparent px-1 py-2 text-base leading-6 text-font placeholder:text-font/45 focus:outline-none"
                />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Add context"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-font/60 transition hover:bg-secondary hover:text-font focus:outline-none focus:ring-2 focus:ring-complement/30"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Voice input"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-font/60 transition hover:bg-secondary hover:text-font focus:outline-none focus:ring-2 focus:ring-complement/30"
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!canSend}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-complement text-main transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-font/40"
                    aria-label="Send message"
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
          </section>
        </div>
      )}
    </>
  );
}
