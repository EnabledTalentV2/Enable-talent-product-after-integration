"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import DashboardProfilePrompt from "@/components/DashboardProfilePrompt";
import { computeProfileCompletion } from "@/lib/profileCompletion";
import { useUserDataStore } from "@/lib/userDataStore";
import { initialUserData } from "@/lib/userDataDefaults";

type ChatMessage = {
  id: string;
  role: "coach" | "user";
  content: string;
};

const STORAGE_KEY = "et_career_coach_chat";

const defaultMessages: ChatMessage[] = [
  {
    id: "coach-welcome",
    role: "coach",
    content:
      "Hi! I am your AI Career Coach. Tell me your goal and I will guide you step by step.",
  },
];

const quickPrompts = [
  "Review my resume summary for clarity",
  "Create a 2-week interview prep plan",
  "Help me tailor my profile for frontend roles",
  "Suggest stronger achievement bullets",
];

const pickCoachReply = (input: string) => {
  const normalized = input.toLowerCase();
  if (normalized.includes("resume") || normalized.includes("summary")) {
    return "Share your summary and the role you want. I will tighten the language and highlight impact.";
  }
  if (normalized.includes("interview")) {
    return "Great. What role and level are you preparing for? I will build a focused prep plan.";
  }
  if (normalized.includes("profile") || normalized.includes("tailor")) {
    return "Tell me the top 3 roles you want. I will map your strengths to those requirements.";
  }
  if (normalized.includes("achievement") || normalized.includes("bullet")) {
    return "List your top projects or wins. I will help you craft results-driven bullets.";
  }
  return "Got it. What outcome do you want from this session?";
};

export default function CareerCoachStartPage() {
  const rawUserData = useUserDataStore((s) => s.userData);
  const userData = useMemo(
    () => ({
      ...initialUserData,
      ...rawUserData,
      basicInfo: { ...initialUserData.basicInfo, ...rawUserData?.basicInfo },
      workExperience: {
        ...initialUserData.workExperience,
        ...rawUserData?.workExperience,
      },
      education: { ...initialUserData.education, ...rawUserData?.education },
      skills: { ...initialUserData.skills, ...rawUserData?.skills },
      projects: { ...initialUserData.projects, ...rawUserData?.projects },
      achievements: {
        ...initialUserData.achievements,
        ...rawUserData?.achievements,
      },
      certification: {
        ...initialUserData.certification,
        ...rawUserData?.certification,
      },
      preference: { ...initialUserData.preference, ...rawUserData?.preference },
      otherDetails: {
        ...initialUserData.otherDetails,
        ...rawUserData?.otherDetails,
      },
      reviewAgree: {
        ...initialUserData.reviewAgree,
        ...rawUserData?.reviewAgree,
      },
    }),
    [rawUserData]
  );
  const { percent: profilePercent } = useMemo(
    () => computeProfileCompletion(userData),
    [userData]
  );
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return;
    }
    try {
      const parsed = JSON.parse(stored) as ChatMessage[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setMessages(parsed);
      }
    } catch {
      // Ignore invalid local data.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isTyping]);

  const sendMessage = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isTyping) {
      return;
    }
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setDraft("");
    setIsTyping(true);

    window.setTimeout(() => {
      const coachMessage: ChatMessage = {
        id: `coach-${Date.now()}`,
        role: "coach",
        content: pickCoachReply(trimmed),
      };
      setMessages((prev) => [...prev, coachMessage]);
      setIsTyping(false);
    }, 650);
  };

  const handleSubmit = () => {
    sendMessage(draft);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleReset = () => {
    setMessages(defaultMessages);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <section className="mx-auto max-w-360 space-y-6 py-10">
      <DashboardProfilePrompt percent={profilePercent} />

      <div className="rounded-[32px] bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard/career-coach"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to Coach
          </Link>
          <div className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1 text-xs font-semibold text-amber-700">
            <Sparkles size={14} />
            Demo mode (offline)
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-slate-900">Start Coaching</h1>
          <p className="text-sm text-slate-500">
            This session runs locally and will connect to the backend later.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[28px] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Session</h2>
            <button
              type="button"
              onClick={handleReset}
              className="text-sm font-semibold text-slate-500 transition hover:text-slate-800"
            >
              Reset
            </button>
          </div>

          <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${
                  message.role === "coach"
                    ? "bg-slate-100 text-slate-700"
                    : "ml-auto bg-amber-100 text-slate-900"
                }`}
              >
                {message.content}
              </div>
            ))}
            {isTyping && (
              <div className="max-w-[70%] rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
                Coach is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
            <label htmlFor="coach-input" className="sr-only">
              Coach input
            </label>
            <textarea
              id="coach-input"
              rows={3}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the coach for help with your resume, interviews, or job search..."
              className="w-full resize-none bg-transparent text-sm text-slate-700 outline-none"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Press Enter to send
              </span>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!draft.trim() || isTyping}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  !draft.trim() || isTyping
                    ? "cursor-not-allowed bg-slate-100 text-slate-400"
                    : "bg-[#C27803] text-white hover:bg-[#A56303]"
                }`}
              >
                <Send size={14} />
                Send
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Quick Prompts
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Tap a prompt to kick off the conversation.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handlePromptClick(prompt)}
                  className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Tips</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>Share a target role to get sharper guidance.</li>
              <li>Include metrics to improve your bullet points.</li>
              <li>Ask for a week-by-week interview plan.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
