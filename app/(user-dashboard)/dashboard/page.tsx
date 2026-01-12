"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import DashboardProfilePrompt from "@/components/DashboardProfilePrompt";
import EngagementTrendChart from "@/components/EngagementTrendChart";
import AttentionWidget from "@/components/employer/dashboard/AttentionWidget";
import DashboardSummaryCard from "@/components/employer/dashboard/DashboardSummaryCard";
import TimeRangeTabs from "@/components/employer/dashboard/TimeRangeTabs";
import { getNotifications, requestNote } from "@/lib/notifications";
import { computeProfileCompletion } from "@/lib/profileCompletion";
import { useUserDataStore } from "@/lib/userDataStore";
import { initialUserData } from "@/lib/userDataDefaults";

type RecentMatch = {
  id: string;
  role: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  matchPercent: number;
  stats: {
    accepted: number;
    declined: number;
    matching: number;
  };
};

type AttentionItem = {
  id: string;
  tone: "warning" | "danger" | "neutral";
  text: string;
};

const engagementSeries = {
  views: {
    label: "Profile views",
    points: [],
  },
  invites: {
    label: "Job Invites",
    points: [],
  },
} as const;

const timeRanges = ["1W", "1M", "3M", "1Y"] as const;

const attentionItems: AttentionItem[] = [];

const recentMatches: RecentMatch[] = [];

const brandStyles: Record<string, string> = {
  Meta: "bg-blue-100 text-blue-700",
  Google: "bg-amber-100 text-amber-700",
  Amazon: "bg-orange-100 text-orange-700",
};

const getBrandKey = (company: string) => company.split(" ")[0] || company;

const getBrandStyle = (company: string) =>
  brandStyles[getBrandKey(company)] ?? "bg-slate-100 text-slate-700";

const getCompanyInitial = (company: string) =>
  getBrandKey(company).slice(0, 1).toUpperCase();

export default function DashboardPage() {
  const rawUserData = useUserDataStore((s) => s.userData);
  const [activeMetric, setActiveMetric] =
    useState<keyof typeof engagementSeries>("views");
  const [activeRange, setActiveRange] =
    useState<(typeof timeRanges)[number]>("1Y");
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const notifications = getNotifications({ limit: 3 });

  // Merge with defaults to ensure all nested objects exist
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
  const profileMatchStrength = Math.round(profilePercent);

  // Filter points based on activeRange
  const filteredPoints = useMemo(() => {
    const allPoints = engagementSeries[activeMetric].points;
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
  }, [activeMetric, activeRange]);

  const metricLabel = engagementSeries[activeMetric].label;
  const metricLabelLower = metricLabel.toLowerCase();

  // Filter notifications and matches based on search query
  const filteredNotifications = useMemo(() => {
    if (!searchQuery.trim()) return notifications;

    const query = searchQuery.toLowerCase();
    return notifications.filter((notice) =>
      notice.company.toLowerCase().includes(query) ||
      notice.message.toLowerCase().includes(query)
    );
  }, [notifications, searchQuery]);

  const filteredMatches = useMemo(() => {
    if (!searchQuery.trim()) return recentMatches;

    const query = searchQuery.toLowerCase();
    return recentMatches.filter((match) =>
      match.role.toLowerCase().includes(query) ||
      match.company.toLowerCase().includes(query) ||
      match.location.toLowerCase().includes(query) ||
      match.type.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const unreadCount = filteredNotifications.filter((notice) => notice.unread).length;
  const summaryMetrics: Array<{ label: string; value: string | number }> = [];
  const hasEngagementData = filteredPoints.length > 0;
  const hasMatches = filteredMatches.length > 0;
  const hasNotifications = filteredNotifications.length > 0;
  const matchCount = filteredMatches.length;

  return (
    <section className="mx-auto max-w-360 space-y-8 py-10">
      <DashboardProfilePrompt percent={profilePercent} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[28px] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recruiter Engagement Trend
              </h2>
              <div className="mt-3 inline-flex rounded-full bg-slate-100 p-1 text-sm font-semibold text-slate-500">
                {Object.entries(engagementSeries).map(([key, value]) => {
                  const isActive = activeMetric === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setActiveMetric(key as keyof typeof engagementSeries)
                      }
                      className={`rounded-full px-3 py-1 transition ${
                        isActive
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      {value.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <TimeRangeTabs
              ranges={timeRanges}
              activeRange={activeRange}
              onChange={setActiveRange}
            />
          </div>

          {hasEngagementData ? (
            <>
              <div className="mt-6 h-64">
                <EngagementTrendChart
                  points={filteredPoints}
                  metricLabel={metricLabelLower}
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#E6A24E]" />
                  Expected {metricLabelLower}
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#4F7DF3]" />
                  Actual {metricLabelLower}
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-emerald-400" />
                  Strong (&gt;=80%) of expected
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-amber-400" />
                  Average (60-79%) of expected
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-red-400" />
                  Low (&lt;60%) of expected
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-400">
                Expected based on role &amp; market
              </p>
            </>
          ) : (
            <div className="mt-6 flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400">
              No engagement data yet.
            </div>
          )}
        </div>

        <div className="space-y-6">
          <DashboardSummaryCard
            title="Profile Match Strength"
            value={`${profileMatchStrength}%`}
            subtitle={
              matchCount > 0
                ? `Across ${matchCount} active job matches`
                : "No active job matches yet"
            }
            metrics={summaryMetrics}
          />

          <AttentionWidget items={attentionItems} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Matches
            </h2>
            {searchQuery && (
              <span className="text-sm text-slate-600">
                {filteredMatches.length} result{filteredMatches.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="space-y-4">
            {hasMatches ? (
              filteredMatches.map((match) => (
                <div
                  key={match.id}
                  className="rounded-[28px] bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full text-base font-semibold ${getBrandStyle(
                          match.company
                        )}`}
                      >
                        {getCompanyInitial(match.company)}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          {match.role}
                        </p>
                        <p className="text-sm text-slate-500">
                          {match.company}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-amber-100 px-2.5 py-1 text-sm font-semibold text-amber-800">
                      {match.matchPercent}% Matching
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {match.type}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {match.experience}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    {match.location}
                  </p>
                  <div className="mt-4 flex items-center gap-6 text-sm text-slate-500">
                    <span>
                      Accepted:{" "}
                      <span className="font-semibold text-slate-700">
                        {match.stats.accepted}
                      </span>
                    </span>
                    <span>
                      Declined:{" "}
                      <span className="font-semibold text-slate-700">
                        {match.stats.declined}
                      </span>
                    </span>
                    <span>
                      Matching:{" "}
                      <span className="font-semibold text-slate-700">
                        {match.stats.matching}
                      </span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[28px] bg-white p-5 text-sm text-slate-500 shadow-sm">
                {searchQuery
                  ? `No matches found for "${searchQuery}".`
                  : "No matches yet."}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-slate-900">
              Notifications
            </h2>
            <span className="text-base text-slate-500">
              ({unreadCount} Unread)
            </span>
            {searchQuery && (
              <span className="text-sm text-slate-600">
                {filteredNotifications.length} result{filteredNotifications.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="space-y-4">
            {hasNotifications ? (
              filteredNotifications.map((notice) => (
                <div
                  key={notice.id}
                  className="rounded-[28px] bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold ${getBrandStyle(
                          notice.company
                        )}`}
                      >
                        {getCompanyInitial(notice.company)}
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-medium text-slate-900">
                          {notice.message}
                        </p>
                        <p className="text-sm text-slate-400">{notice.time}</p>
                      </div>
                    </div>
                    {notice.unread ? (
                      <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                    ) : null}
                  </div>

                  {notice.type === "request" ? (
                    <div className="mt-4 space-y-3">
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          className="rounded-lg bg-[#C27803] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                        >
                          Accept request
                        </button>
                        <button
                          type="button"
                          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                        >
                          Decline request
                        </button>
                      </div>
                      <div className="flex items-start gap-2 rounded-xl bg-[#FDE8E8] px-3 py-2 text-sm text-[#B42318]">
                        <AlertCircle className="mt-0.5 h-4 w-4" />
                        <span>{requestNote}</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-[28px] bg-white p-5 text-sm text-slate-500 shadow-sm">
                {searchQuery
                  ? `No notifications found for "${searchQuery}".`
                  : "No notifications yet."}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
