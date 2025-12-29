"use client";

import React, { useState, useEffect, useMemo } from "react";
import JobHeader from "@/components/employer/candidates/JobHeader";
import CandidateList from "@/components/employer/candidates/CandidateList";
import CandidateDetail from "@/components/employer/candidates/CandidateDetail";
import { CandidateProfile, CandidateStage } from "./types";
import { MOCK_JOBS, MOCK_CANDIDATES, getJobStats } from "../mock-db";

const TABS = [
  { id: "accepted", label: "Accepted" },
  { id: "declined", label: "Declined" },
  { id: "request_sent", label: "Request sent" },
  { id: "matching", label: "Matching" },
] as const;

// --- Service Simulation ---

const fetchCandidates = async (
  jobId: string,
  stage: CandidateStage
): Promise<CandidateProfile[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Filter from SHARED database by Job ID AND Stage
  return MOCK_CANDIDATES.filter((c) => c.jobId === jobId && c.stage === stage);
};

export default function CandidatesPage() {
  // In a real app, you would get this ID from the URL params (e.g., /candidates/[jobId])
  // For now, we select the first job as the "Active" context
  const currentJobId = "job-1";
  const currentJob = MOCK_JOBS.find((j) => j.id === currentJobId);

  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]["id"]>("matching");
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Calculate stats dynamically for the current job
  const jobStats = useMemo(() => getJobStats(currentJobId), [currentJobId]);

  useEffect(() => {
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
  }, [activeTab, currentJobId]);

  const selectedCandidate =
    candidates.find((c) => c.id === selectedCandidateId) || null;

  if (!currentJob) return <div>Job not found</div>;

  return (
    <div className="mx-auto flex h-[calc(100vh-100px)] max-w-360 flex-col gap-6 p-4 sm:p-6 lg:h-[calc(100vh-120px)]">
      {/* Top Section: Job Header */}
      <div className="shrink-0">
        {/* Pass the shared job info and calculated stats */}
        <JobHeader jobInfo={currentJob} stats={jobStats} />
      </div>

      {/* Main Content: Split View */}
      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
        {/* Left Column: List */}
        <div className="flex flex-1 flex-col gap-4 lg:max-w-[480px]">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
      </div>
    </div>
  );
}
