"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import DashboardProfilePrompt from "@/components/DashboardProfilePrompt";
import { computeProfileCompletion } from "@/lib/profileCompletion";
import { useUserDataStore } from "@/lib/userDataStore";
import { initialUserData } from "@/lib/userDataDefaults";
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
  "Review my resume summary for clarity",
  "Create a 2-week interview prep plan",
  "Help me tailor my profile for frontend roles",
  "Suggest stronger achievement bullets",
];

export default function CareerCoachStartPage() {
  const router = useRouter();
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

  // Hooks for API interaction
  const { data: profileData, fetchCandidateProfile } = useFetchCandidateProfile();
  const { sendCareerCoachMessage, isLoading: isSendingMessage } = useCareerCoach();

  // State management
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);
  const [draft, setDraft] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [resumeSlug, setResumeSlug] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Fetch candidate profile on mount to get resume slug
  useEffect(() => {
    fetchCandidateProfile();
  }, [fetchCandidateProfile]);

  // Update resume slug when profile data is available
  useEffect(() => {
    if (profileData?.slug) {
      setResumeSlug(profileData.slug);
    }
  }, [profileData]);

  // Load messages from localStorage
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const storedThreadId = window.localStorage.getItem(THREAD_ID_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch {
        // Ignore invalid local data.
      }
    }
    if (storedThreadId) {
      setThreadId(storedThreadId);
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Save thread ID to localStorage
  useEffect(() => {
    if (typeof window === "undefined" || !threadId) {
      return;
    }
    window.localStorage.setItem(THREAD_ID_KEY, threadId);
  }, [threadId]);

  // Auto-scroll to bottom
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
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setDraft("");

    // Send to API
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

      // Check if session expired
      if (handleSessionExpiry(result.error, router)) {
        return;
      }

      // Show error message in chat
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "coach",
        content: `Sorry, I encountered an error: ${result.error}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } else if (result.data) {
      console.log("[Career Coach] Success! Response:", result.data);

      // Update thread ID if it's new
      if (result.data.thread_id && result.data.thread_id !== threadId) {
        console.log("[Career Coach] Updating thread ID:", result.data.thread_id);
        setThreadId(result.data.thread_id);
      }

      // Add coach response
      const coachMessage: ChatMessage = {
        id: `coach-${Date.now()}`,
        role: "coach",
        content: result.data.output,
      };
      console.log("[Career Coach] Adding coach message:", coachMessage);
      setMessages((prev) => [...prev, coachMessage]);
    } else {
      console.warn("[Career Coach] No data and no error in result");
    }

    // Refocus the textarea after message is sent
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
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
    setThreadId(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(THREAD_ID_KEY);
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
          <div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-1 text-xs font-semibold text-green-700">
            <Sparkles size={14} />
            AI-Powered
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-slate-900">Start Coaching</h1>
          <p className="text-sm text-slate-500">
            Get personalized career guidance powered by AI. Your conversation is saved automatically.
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
                {message.role === "coach" ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  message.content
                )}
              </div>
            ))}
            {isSendingMessage && (
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
              ref={textareaRef}
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
                disabled={!draft.trim() || isSendingMessage}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  !draft.trim() || isSendingMessage
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
