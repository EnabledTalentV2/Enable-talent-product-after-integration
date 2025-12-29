"use client";

import { useMemo } from "react";
import Link from "next/link";
import { BriefcaseBusiness, FileText, MessageSquareText, Sparkles } from "lucide-react";
import DashboardProfilePrompt from "@/components/DashboardProfilePrompt";
import { computeProfileCompletion } from "@/lib/profileCompletion";
import { useUserDataStore } from "@/lib/userDataStore";

const quickPrompts = [
  "Review my resume summary for clarity",
  "Create a 2-week interview prep plan",
  "Help me tailor my profile for frontend roles",
  "Suggest stronger achievement bullets",
];

export default function CareerCoachPage() {
  const userData = useUserDataStore((s) => s.userData);
  const { percent: profilePercent } = useMemo(() => computeProfileCompletion(userData), [userData]);

  return (
    <section className="mx-auto max-w-360 space-y-6 py-10">
      <DashboardProfilePrompt percent={profilePercent} />

      <div className="rounded-[32px] bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-slate-900">
              <Sparkles className="h-6 w-6 text-amber-500" />
              <h1 className="text-2xl font-bold">AI Career Coach</h1>
            </div>
            <p className="max-w-2xl text-base text-slate-600">
              Get personalized guidance on your resume, interview prep, and job search
              strategy. This is a placeholder until the coach is wired to the backend.
            </p>
          </div>
          <Link
            href="/dashboard/career-coach/start"
            className="rounded-full bg-[#C27803] px-5 py-2 text-base font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Start coaching session
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-[#FFFBEB] p-4">
            <div className="flex items-center gap-2 text-slate-800">
              <FileText className="h-5 w-5 text-amber-500" />
              <h2 className="text-base font-semibold">Resume Review</h2>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Tighten your summary, highlight impact, and improve clarity.
            </p>
          </div>
          <div className="rounded-2xl bg-[#F0F9FF] p-4">
            <div className="flex items-center gap-2 text-slate-800">
              <MessageSquareText className="h-5 w-5 text-blue-500" />
              <h2 className="text-base font-semibold">Interview Prep</h2>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Practice common questions and build a tailored prep plan.
            </p>
          </div>
          <div className="rounded-2xl bg-[#F8FAFC] p-4">
            <div className="flex items-center gap-2 text-slate-800">
              <BriefcaseBusiness className="h-5 w-5 text-slate-700" />
              <h2 className="text-base font-semibold">Job Fit Strategy</h2>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Align your profile with the roles you want most.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[28px] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Session Preview</h2>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-100 px-4 py-3">
              I want to sharpen my resume summary for design roles.
            </div>
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-slate-700">
              Great, I can help with that. Share your summary and the role you are targeting.
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3">
              Can you also suggest the top three achievements to highlight?
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-400">
            Coaching chat input will appear here.
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Quick Prompts</h2>
          <p className="mt-2 text-sm text-slate-500">
            Use these to jump-start your first coaching session.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {quickPrompts.map((prompt) => (
              <span
                key={prompt}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700"
              >
                {prompt}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
