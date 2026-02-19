"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Sparkles, Bot, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useCareerCoach } from "@/lib/hooks/useCareerCoach";
import { useFetchCandidateProfile } from "@/lib/hooks/useFetchCandidateProfile";
import { handleSessionExpiry } from "@/lib/api-client";

type ChatMessage = {
  id: string;
  role: "coach" | "user";
  content: string;
};

const STORAGE_KEY = "et_career_coach_chat";
const THREAD_ID_KEY = "et_career_coach_thread_id";

const defaultMessages: ChatMessage[] = [
  {
    id: "coach-welcome",
    role: "coach",
    content:
      "Hi! I am your AI Career Coach. Tell me your goal and I will guide you step by step.",
  },
];

const quickPrompts = [
  "How can I improve my career profile?",
  "What skills are in demand for my field?",
  "Help me prepare for job interviews",
  "How should I highlight my strengths?",
  "Tips for networking in my industry",
  "How to negotiate a better salary offer?",
];

export default function CareerCoachStartPage() {
  const router = useRouter();

  const { data: profileData, fetchCandidateProfile } =
    useFetchCandidateProfile();
  const { sendCareerCoachMessage, isLoading: isSendingMessage } =
    useCareerCoach();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") return defaultMessages;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // Ignore invalid local data.
      }
    }
    return defaultMessages;
  });
  const [draft, setDraft] = useState("");
  const [threadId, setThreadId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(THREAD_ID_KEY);
  });
  const resumeSlug = profileData?.slug ?? null;
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLInputElement | null>(null);
  const msgCounterRef = useRef(0);

  useEffect(() => {
    fetchCandidateProfile();
  }, [fetchCandidateProfile]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (typeof window === "undefined" || !threadId) {
      return;
    }
    window.localStorage.setItem(THREAD_ID_KEY, threadId);
  }, [threadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isSendingMessage]);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isSendingMessage) {
      return;
    }

    if (!resumeSlug) {
      alert("Unable to send message. Profile not loaded yet.");
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${msgCounterRef.current++}`,
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setDraft("");

    console.log("[Career Coach] Sending message:", {
      input_text: trimmed,
      resume_slug: resumeSlug,
      thread_id: threadId,
    });

    const result = await sendCareerCoachMessage({
      input_text: trimmed,
      resume_slug: resumeSlug,
      thread_id: threadId,
    });

    console.log("[Career Coach] API result:", result);

    if (result.error) {
      console.error("[Career Coach] Error:", result.error);

      if (handleSessionExpiry(result.error, router)) {
        return;
      }

      const errorMessage: ChatMessage = {
        id: `error-${msgCounterRef.current++}`,
        role: "coach",
        content: `Sorry, I encountered an error: ${result.error}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } else if (result.data) {
      console.log("[Career Coach] Success! Response:", result.data);

      if (result.data.thread_id && result.data.thread_id !== threadId) {
        setThreadId(result.data.thread_id);
      }

      const coachMessage: ChatMessage = {
        id: `coach-${msgCounterRef.current++}`,
        role: "coach",
        content: result.data.output,
      };
      setMessages((prev) => [...prev, coachMessage]);
    } else {
      console.warn("[Career Coach] No data and no error in result");
    }

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleSubmit = () => {
    sendMessage(draft);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  const isConversationStarted = messages.length > 1;

  return (
    <section className="mx-auto max-w-[1400px] p-4 lg:p-8">
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[340px_1fr] xl:grid-cols-[380px_1fr]">
        {/* --- LEFT SIDEBAR --- */}
        <aside
          className="flex flex-col gap-6"
          aria-label="Sidebar with career tips and prompts"
        >
          {/* Banner Card */}
          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#D9643A] to-[#E8A359] p-6 text-white shadow-lg">
            <div className="relative z-10">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Bot
                  size={24}
                  className="text-white"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </div>
              <h2 className="text-2xl font-bold leading-tight">
                Career Advisor
              </h2>
              <p className="opacity-90 mt-1 text-sm font-medium">
                Your AI-powered career coach
              </p>
            </div>
            {/* Decorative Elements */}
            <div
              className="absolute right-[-20px] top-[-20px] h-32 w-32 rounded-full border-[16px] border-white/10"
              aria-hidden="true"
            />
            <div
              className="absolute bottom-[-10px] right-[-10px] text-white/10"
              aria-hidden="true"
            >
              <Bot size={120} />
            </div>
          </div>

          {/* "Ask me about" Section */}
          <div className="flex-1 rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h3 className="border-b border-slate-100 pb-4 text-lg font-bold text-slate-900">
              Ask me about
            </h3>

            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Career advancement strategies, Resume and profile optimization,
              Interview preparation tips, Industry-specific advice, Skill
              development recommendations
            </p>

            <div className="mt-6 space-y-3">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={prompt}
                  onClick={() => handlePromptClick(prompt)}
                  className={`w-full text-left rounded-2xl px-5 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#D9643A] focus:ring-offset-2
                    ${
                      index === 0
                        ? "border-2 border-[#D9643A] bg-white text-[#D9643A]"
                        : "bg-[#FFF8F0] text-slate-700 hover:bg-[#FCECD8]"
                    }
                  `}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* --- RIGHT MAIN CHAT AREA --- */}
        <main
          className="flex h-[calc(100vh-140px)] min-h-[600px] flex-col rounded-[32px] bg-white shadow-sm ring-1 ring-slate-100"
          aria-label="Chat Interface"
        >
          {/* Header */}
          <div className="border-b border-slate-100 px-8 py-6">
            <h1 className="text-xl font-bold text-slate-900">Career Coach</h1>
          </div>

          {/* Chat Content */}
          <div
            className="flex-1 overflow-y-auto px-8 py-6"
            id="chat-container"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            tabIndex={0}
            aria-label="Chat history"
          >
            {!isConversationStarted ? (
              // Empty State / Hero View
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#FFECD2] to-[#FCB69F]">
                  <Sparkles
                    size={40}
                    className="text-white drop-shadow-sm"
                    aria-hidden="true"
                  />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Hi! I&apos;m your Career Coach
                </h2>
                <p className="mt-3 max-w-md text-slate-500">
                  I can help you navigate your career path, prepare for
                  interviews, improve your resume, and provide personalized
                  guidance for your professional development.
                </p>
              </div>
            ) : (
              // Chat Message List
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "coach" ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-3xl px-6 py-4 text-sm leading-relaxed ${
                        message.role === "coach"
                          ? "bg-slate-50 text-slate-800"
                          : "bg-[#4A3B32] text-white"
                      }`}
                    >
                      {message.role === "coach" ? (
                        <div className="prose prose-sm max-w-none prose-p:text-slate-800 prose-headings:text-slate-900 prose-strong:text-slate-900 prose-ul:text-slate-800">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                ))}
                {isSendingMessage && (
                  <div className="flex justify-start">
                    <div
                      className="flex items-center gap-2 rounded-3xl bg-slate-50 px-6 py-4 text-xs text-slate-500"
                      role="status"
                      aria-busy="true"
                    >
                      <Loader2
                        size={14}
                        className="animate-spin"
                        aria-hidden="true"
                      />
                      Coach is thinking...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Footer / Input Styling */}
          <div className="px-8 pb-8 pt-2">
            <div className="relative mt-auto">
              {/* Input Box */}
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 pl-5 pr-2 shadow-sm transition focus-within:border-[#D9643A] focus-within:ring-1 focus-within:ring-[#D9643A]">
                <label htmlFor="chat-input" className="sr-only">
                  Type your message to the career coach
                </label>
                <input
                  id="chat-input"
                  ref={textareaRef}
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your career coach..."
                  className="flex-1 bg-transparent py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:placeholder:text-slate-300"
                  aria-invalid="false"
                />

                <button
                  onClick={handleSubmit}
                  disabled={!draft.trim() || isSendingMessage}
                  className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#C27803] focus:ring-offset-1
                    ${
                      !draft.trim() || isSendingMessage
                        ? "bg-slate-300 cursor-not-allowed"
                        : "bg-[#C27803] hover:bg-[#A66702] active:scale-95"
                    }`}
                  aria-label="Send message"
                >
                  <Send size={16} strokeWidth={2.5} aria-hidden="true" />
                  <span>Send</span>
                </button>
              </div>

              {/* Footer Note */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
                <Sparkles size={12} aria-hidden="true" />
                <span>
                  Using your profile data for personalized career advice
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}
