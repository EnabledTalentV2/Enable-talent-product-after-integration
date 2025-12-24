"use client";

import { useMemo, useState } from "react";
import EngagementTrendChart from "@/components/EngagementTrendChart";
import RecentJobCard from "@/components/dashboard/RecentJobCard";
import CandidateCard from "@/components/dashboard/CandidateCard";
import AttentionWidget from "@/components/dashboard/AttentionWidget";
import DashboardSummaryCard from "@/components/dashboard/DashboardSummaryCard";
import TimeRangeTabs from "@/components/dashboard/TimeRangeTabs";

// --- Types ---

type AcceptanceRatePoint = {
  label: string;
  actual: number;
  expected: number;
};

type RecentJob = {
  id: string;
  role: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  postedTime: string;
  stats: {
    accepted: number;
    declined: number;
    matching: number;
  };
};

type AcceptedCandidate = {
  id: string;
  name: string;
  role: string;
  location: string;
  experience: string;
  matchPercent: number;
  status: "Active" | "Inactive";
  avatarUrl?: string;
};

type AttentionItem = {
  id: string;
  tone: "warning" | "danger" | "neutral";
  text: string;
};

// --- Mock Data ---

const acceptanceRateSeries = {
  rate: {
    label: "Acceptance Rate",
    points: [
      { label: "Mar", actual: 65, expected: 60 },
      { label: "Apr", actual: 68, expected: 62 },
      { label: "May", actual: 75, expected: 65 },
      { label: "Jun", actual: 72, expected: 68 },
      { label: "Jul", actual: 80, expected: 70 },
      { label: "Aug", actual: 82, expected: 72 },
      { label: "Sep", actual: 85, expected: 75 },
      { label: "Oct", actual: 83, expected: 78 },
      { label: "Nov", actual: 78, expected: 80 },
      { label: "Dec", actual: 75, expected: 78 },
      { label: "Jan", actual: 72, expected: 75 },
      { label: "Feb", actual: 70, expected: 72 },
    ],
  },
};

const timeRanges = ["1W", "1M", "3M", "1Y"] as const;

const attentionItems: AttentionItem[] = [
  {
    id: "pending-review",
    tone: "warning",
    text: "3 candidates pending review",
  },
  {
    id: "job-deadline",
    tone: "danger",
    text: "1 job nearing deadline",
  },
  {
    id: "low-match",
    tone: "neutral",
    text: 'Low match rate for "SE Role"',
  },
];

const recentJobs: RecentJob[] = [
  {
    id: "ui-ux-designer",
    role: "UI/UX Designer",
    company: "Meta",
    location: "Allentown, New Mexico 31134",
    type: "Full Time",
    experience: "Exp: 5+ Years",
    postedTime: "Posted 12 hrs ago",
    stats: {
      accepted: 56,
      declined: 367,
      matching: 97,
    },
  },
  {
    id: "software-engineer",
    role: "Software Engineer",
    company: "Meta",
    location: "Allentown, New Mexico 31134",
    type: "Full Time",
    experience: "Exp: 5+ Years",
    postedTime: "Posted 12 hrs ago",
    stats: {
      accepted: 56,
      declined: 367,
      matching: 97,
    },
  },
  {
    id: "software-engineer-2",
    role: "Software Engineer",
    company: "Meta",
    location: "Allentown, New Mexico 31134",
    type: "Full Time",
    experience: "Exp: 5+ Years",
    postedTime: "Posted 12 hrs ago",
    stats: {
      accepted: 56,
      declined: 367,
      matching: 97,
    },
  },
];

const acceptedCandidates: AcceptedCandidate[] = [
  {
    id: "jennifer-allison",
    name: "Jennifer Allison",
    role: "UX Designer",
    location: "Allentown, New Mexico 31134",
    experience: "12 Yrs",
    matchPercent: 97,
    status: "Active",
  },
  {
    id: "henry-creel",
    name: "Henry Creel",
    role: "Marketing Analyst",
    location: "Allentown, New Mexico 31134",
    experience: "12 Yrs",
    matchPercent: 97,
    status: "Active",
  },
  {
    id: "milley-arthur",
    name: "Milley Arthur",
    role: "Data Analyst",
    location: "Allentown, New Mexico 31134",
    experience: "12 Yrs",
    matchPercent: 97,
    status: "Active",
  },
  {
    id: "milley-arthur-2",
    name: "Milley Arthur",
    role: "Data Analyst",
    location: "Allentown, New Mexico 31134",
    experience: "12 Yrs",
    matchPercent: 97,
    status: "Active",
  },
];

// --- Helpers ---

const brandStyles: Record<string, string> = {
  Meta: "bg-blue-100 text-blue-700",
  Google: "bg-amber-100 text-amber-700",
  Amazon: "bg-orange-100 text-orange-700",
};

const getBrandKey = (company: string) => company.split(" ")[0] || company;

const getBrandStyle = (company: string) =>
  brandStyles[getBrandKey(company)] ?? "bg-slate-100 text-slate-700";

const formatDelta = (value: number) => ({
  label: `${value >= 0 ? "+" : "-"}${Math.abs(value)} vs last month`,
  className: value >= 0 ? "text-emerald-600" : "text-red-600",
});

export default function EmployerDashboardPage() {
  const [activeRange, setActiveRange] =
    useState<(typeof timeRanges)[number]>("1Y");

  // Filter points based on activeRange
  const filteredPoints = useMemo(() => {
    const allPoints = acceptanceRateSeries.rate.points;
    switch (activeRange) {
      case "1W":
        return allPoints.slice(-1); // Show last month as proxy for 1W
      case "1M":
        return allPoints.slice(-1);
      case "3M":
        return allPoints.slice(-3);
      case "1Y":
      default:
        return [...allPoints];
    }
  }, [activeRange]);

  const activeJobsDelta = formatDelta(-6);
  const candidatesAcceptedDelta = formatDelta(20);
  const summaryMetrics = [
    { label: "Active Jobs", value: "42", delta: activeJobsDelta },
    {
      label: "Candidates accepted",
      value: "367",
      delta: candidatesAcceptedDelta,
    },
  ];

  return (
    <section className="mx-auto max-w-[1400px] space-y-8 py-10 px-6 mt-6">
      {/* Top Section: Chart & Stats */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Chart Card */}
        <div className="rounded-[28px] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Candidate Acceptance Rate
              </h2>
            </div>
            <TimeRangeTabs
              ranges={timeRanges}
              activeRange={activeRange}
              onChange={setActiveRange}
            />
          </div>

          <div className="mt-6 h-64">
            <EngagementTrendChart points={filteredPoints} metricLabel="rate" />
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#E6A24E]" />
              Projected
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#4F7DF3]" />
              Actual
            </span>
            <div className="flex items-center gap-4 ml-auto">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm bg-emerald-400" />
                Good: ≥ 80%
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm bg-amber-400" />
                Moderate: 60-79%
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm bg-red-400" />
                Poor: &lt; 60%
              </span>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Projected rate based on historical performance, role complexity, and
            market benchmarks
          </p>
        </div>

        {/* Right Column: Stats & Attention */}
        <div className="space-y-6">
          {/* Stats Card */}
          <DashboardSummaryCard
            title="Matching applicants"
            value="97"
            subtitle="Across 42 jobs (avg. 2.3 / job)"
            metrics={summaryMetrics}
          />

          {/* Attention Needed Card */}
          <AttentionWidget items={attentionItems} />
        </div>
      </div>

      {/* Bottom Section: Recent Jobs & Accepted Candidates */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Jobs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Jobs
            </h2>
          </div>
          <div className="space-y-4">
            {recentJobs.map((job) => (
              <RecentJobCard
                key={job.id}
                job={job}
                getBrandStyle={getBrandStyle}
              />
            ))}
          </div>
        </div>

        {/* Accepted Candidates */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-slate-900">
              Accepted Candidates
            </h2>
          </div>
          <div className="space-y-4">
            {acceptedCandidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
