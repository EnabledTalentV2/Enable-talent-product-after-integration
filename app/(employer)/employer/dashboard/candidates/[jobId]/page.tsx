"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import JobHeader from "@/components/employer/candidates/JobHeader";
import CandidateList from "@/components/employer/candidates/CandidateList";
import CandidateDetail from "@/components/employer/candidates/CandidateDetail";
import CandidateRankingPanel from "@/components/employer/ai/CandidateRankingPanel";
import { CandidateProfile, CandidateStage } from "@/lib/types/candidates";
import { useEmployerJobsStore } from "@/lib/employerJobsStore";
import { emptyJobStats, toJobHeaderInfo } from "@/lib/employerJobsUtils";

const TABS = [
  { id: "ai_ranking", label: "✨ AI Ranking" },
  { id: "accepted", label: "Accepted" },
  { id: "declined", label: "Declined" },
  { id: "request_sent", label: "Request sent" },
  { id: "matching", label: "Matching" },
] as const;

const fetchCandidates = async (
  _jobId: string,
  _stage: CandidateStage
): Promise<CandidateProfile[]> => {
  return [];
};

export default function CandidatesPage() {
  const router = useRouter();
  const params = useParams();
  const jobIdParam = Array.isArray(params.jobId) ? params.jobId[0] : params.jobId;
  const currentJobId = typeof jobIdParam === "string" ? jobIdParam : "";
  const { jobs, hasFetched } = useEmployerJobsStore();

  const currentJob = useMemo(() => {
    if (!currentJobId) return null;
    return jobs.find((job) => job.id === currentJobId) ?? null;
  }, [currentJobId, jobs]);

  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]["id"]>("ai_ranking");
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Calculate stats dynamically for the current job
  const jobStats = useMemo(() => emptyJobStats(), []);

  useEffect(() => {
    if (!currentJobId) return;
    if (hasFetched && !currentJob) {
      router.replace("/employer/dashboard/listed-jobs");
    }
  }, [currentJobId, currentJob, hasFetched, router]);

  useEffect(() => {
    if (!currentJobId || !currentJob) {
      return;
    }

    let isMounted = true;

    const loadCandidates = async () => {
      setIsLoading(true);
      try {
        const data = await fetchCandidates(currentJobId, activeTab);
        if (isMounted) {
          setCandidates(data);
          // Auto-select the first candidate if available
          if (data.length > 0) {
            setSelectedCandidateId(data[0].id);
          } else {
            setSelectedCandidateId(null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch candidates", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCandidates();

    return () => {
      isMounted = false;
    };
  }, [activeTab, currentJobId, currentJob]);

  const selectedCandidate =
    candidates.find((c) => c.id === selectedCandidateId) || null;

  if (!currentJobId || !hasFetched) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Loading candidates...
      </div>
    );
  }

  if (!currentJob) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Redirecting to listed jobs...
      </div>
    );
  }

  const jobHeaderInfo = toJobHeaderInfo(currentJob);

  return (
    <div className="mx-auto flex h-[calc(100vh-100px)] max-w-360 flex-col gap-6 p-4 sm:p-6 lg:h-[calc(100vh-120px)]">
      {/* Top Section: Job Header */}
      <div className="shrink-0">
        {/* Pass the shared job info and calculated stats */}
        <JobHeader jobInfo={jobHeaderInfo} stats={jobStats} />
      </div>

      {/* Main Content: Split View */}
      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-xl px-6 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "bg-[#C27803] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* AI Ranking View */}
        {activeTab === "ai_ranking" ? (
          <div className="flex-1 overflow-auto">
            <CandidateRankingPanel
              jobId={currentJobId}
              onCandidateSelect={(candidateIdOrSlug) => {
                console.log("Selected candidate:", candidateIdOrSlug);
                // Navigate to candidate profile
                // If backend provides slug, it will be a string, otherwise it's the ID (number)
                router.push(`/employer/dashboard/candidates/profile/${candidateIdOrSlug}`);
              }}
            />
          </div>
        ) : (
          <>
            {/* Left Column: List */}
            <div className="flex flex-1 flex-col gap-4 lg:max-w-[480px]">
              {/* Candidate List */}
              <div className="min-h-0 flex-1 rounded-[28px] bg-white p-4 shadow-sm relative">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-[28px]">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#C27803]"></div>
                  </div>
                ) : candidates.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-slate-500">
                    No candidates found in this category.
                  </div>
                ) : (
                  <CandidateList
                    candidates={candidates}
                    selectedId={selectedCandidateId}
                    onSelect={setSelectedCandidateId}
                  />
                )}
              </div>
            </div>

            {/* Right Column: Detail View */}
            <div className="hidden min-h-0 flex-1 lg:block">
              <CandidateDetail candidate={selectedCandidate} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
