"use client";

import { useMemo, useState } from "react";
import EngagementTrendChart from "@/components/EngagementTrendChart";
import RecentJobCard from "@/components/employer/dashboard/RecentJobCard";
import CandidateCard from "@/components/employer/dashboard/CandidateCard";
import AttentionWidget from "@/components/employer/dashboard/AttentionWidget";
import DashboardSummaryCard from "@/components/employer/dashboard/DashboardSummaryCard";
import TimeRangeTabs from "@/components/employer/dashboard/TimeRangeTabs";
import { useEmployerJobsStore } from "@/lib/employerJobsStore";
import {
  emptyJobStats,
  formatExperienceLabel,
  formatPostedTime,
} from "@/lib/employerJobsUtils";

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

const acceptanceRatePoints: AcceptanceRatePoint[] = [];

const timeRanges = ["1W", "1M", "3M", "1Y"] as const;

const attentionItems: AttentionItem[] = [];

// --- Helpers ---

const brandStyles: Record<string, string> = {
  Meta: "bg-blue-100 text-blue-700",
  Google: "bg-amber-100 text-amber-700",
  Amazon: "bg-orange-100 text-orange-700",
};

const getBrandKey = (company: string) => company.split(" ")[0] || company;

const getBrandStyle = (company: string) =>
  brandStyles[getBrandKey(company)] ?? "bg-slate-100 text-slate-700";

export default function EmployerDashboardPage() {
  const jobs = useEmployerJobsStore((state) => state.jobs);
  const [activeRange, setActiveRange] =
    useState<(typeof timeRanges)[number]>("1Y");

  // Filter points based on activeRange
  const filteredPoints = useMemo(() => {
    const allPoints = acceptanceRatePoints;
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
  const hasChartData = filteredPoints.length > 0;

  const totalActiveJobs = jobs.filter((job) => job.status === "Active").length;
  const totalAcceptedCandidates = 0;
  const totalMatchingCandidates = 0;

  const recentJobs = useMemo<RecentJob[]>(() => {
    return [...jobs]
      .sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt))
      .map((job) => {
        const stats = emptyJobStats();
        return {
          id: job.id,
          role: job.title,
          company: job.company,
          location: job.location,
          type: job.employmentType,
          experience: formatExperienceLabel(job.experience),
          postedTime: `Posted ${formatPostedTime(job.postedAt)}`,
          stats: {
            accepted: stats.accepted,
            declined: stats.declined,
            matching: stats.matchingCandidates,
          },
        };
      });
  }, [jobs]);

  const acceptedCandidates: AcceptedCandidate[] = [];

  const summaryMetrics = [
    {
      label: "Active Jobs",
      value: totalActiveJobs.toString(),
    },
    {
      label: "Candidates accepted",
      value: totalAcceptedCandidates.toString(),
    },
  ];

  return (
    <section className="mx-auto max-w-360 space-y-6 px-4 py-8 mt-4 sm:space-y-8 sm:px-6 sm:py-10 sm:mt-6">
      {/* Top Section: Chart & Stats */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Chart Card */}
        <div className="rounded-[28px] bg-white p-4 shadow-sm sm:p-6 min-w-0">
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

          <div className="mt-6 h-56 sm:h-64">
            {hasChartData ? (
              <EngagementTrendChart points={filteredPoints} metricLabel="rate" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No acceptance data yet.
              </div>
            )}
          </div>

          {hasChartData ? (
            <>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-[#E6A24E]" />
                  Projected
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-[#4F7DF3]" />
                  Actual
                </span>
                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto sm:ml-auto">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-sm bg-emerald-400" />
                    Good: &gt;= 80%
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
                Projected rate based on historical performance, role complexity,
                and market benchmarks
              </p>
            </>
          ) : null}
        </div>

        {/* Right Column: Stats & Attention */}
        <div className="flex flex-col gap-6 min-w-0">
          <DashboardSummaryCard
            title="Matching applicants"
            value={totalMatchingCandidates.toString()}
            subtitle={`Across ${totalActiveJobs} jobs (avg. ${(
              totalMatchingCandidates / (totalActiveJobs || 1)
            ).toFixed(1)} / job)`}
            metrics={summaryMetrics}
          />

          <AttentionWidget items={attentionItems} />
        </div>
      </div>

      {/* Bottom Section: Recent Jobs & Accepted Candidates */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Jobs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
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
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
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
