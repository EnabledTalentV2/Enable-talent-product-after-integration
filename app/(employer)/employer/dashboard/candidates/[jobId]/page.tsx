"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import JobHeader from "@/components/employer/candidates/JobHeader";
import CandidateList from "@/components/employer/candidates/CandidateList";
import CandidateRankingPanel from "@/components/employer/ai/CandidateRankingPanel";
import ApplicantsList, { Application } from "@/components/employer/candidates/ApplicantsList";
import { CandidateProfile, CandidateStage } from "@/lib/types/candidates";
import { useEmployerJobsStore } from "@/lib/employerJobsStore";
import { emptyJobStats, toJobHeaderInfo } from "@/lib/employerJobsUtils";

const TABS = [
  { id: "ai_ranking", label: "✨ AI Ranking", status: null },
  { id: "applicants", label: "Applicants", status: "applied" },
  { id: "accepted", label: "Accepted", status: "shortlisted" },
  { id: "declined", label: "Declined", status: "rejected" },
  { id: "hired", label: "Hired", status: "hired" },
] as const;

const fetchCandidates = async (
  _jobId: string,
  _stage: CandidateStage
): Promise<CandidateProfile[]> => {
  return [];
};

const fetchApplications = async (
  jobId: string
): Promise<{ data: Application[]; error?: string }> => {
  try {
    console.log("Fetching applications for job:", jobId);
    const response = await fetch(`/api/jobs/${jobId}/applications`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Failed to fetch applications:", response.status, errorData);

      const errorMessage = errorData.error || `HTTP ${response.status}: Failed to fetch applications`;
      return { data: [], error: errorMessage };
    }

    const data = await response.json();
    console.log("Fetched applications:", data);
    return { data, error: undefined };
  } catch (error) {
    console.error("Error fetching applications:", error);
    const errorMessage = error instanceof Error ? error.message : "Network error";
    return { data: [], error: errorMessage };
  }
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
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [applicationsError, setApplicationsError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  // Filter applications based on active tab
  const filteredApplications = useMemo(() => {
    const currentTabConfig = TABS.find(tab => tab.id === activeTab);
    if (!currentTabConfig || !currentTabConfig.status) {
      return allApplications;
    }
    return allApplications.filter(app => app.status === currentTabConfig.status);
  }, [allApplications, activeTab]);

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

    // Skip fetching for AI ranking tab
    if (activeTab === "ai_ranking") {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setApplicationsError(undefined);
      try {
        // Fetch applications for all application-based tabs
        const currentTabConfig = TABS.find(tab => tab.id === activeTab);
        if (currentTabConfig && currentTabConfig.status !== null) {
          const result = await fetchApplications(currentJobId);
          if (isMounted) {
            setAllApplications(result.data);
            setApplicationsError(result.error);
          }
        } else {
          // Fetch candidates for other tabs (if needed in future)
          const candidatesData = await fetchCandidates(currentJobId, activeTab as CandidateStage);
          if (isMounted) {
            setCandidates(candidatesData);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [activeTab, currentJobId, currentJob]);

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

      {/* Main Content: Full Width Layout */}
      <div className="flex min-h-0 flex-1 flex-col gap-6">
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
              onCandidateSelect={(candidateIdOrSlug, applicationId) => {
                console.log("Selected candidate:", candidateIdOrSlug, "Application ID:", applicationId);
                // Navigate to candidate profile with jobId and applicationId
                const url = `/employer/dashboard/candidates/profile/${candidateIdOrSlug}?jobId=${currentJobId}${applicationId ? `&applicationId=${applicationId}` : ''}`;
                router.push(url);
              }}
            />
          </div>
        ) : activeTab === "applicants" || activeTab === "accepted" || activeTab === "declined" || activeTab === "hired" ? (
          /* Applications View - for all application-based tabs */
          <div className="min-h-0 flex-1 overflow-auto rounded-[28px] bg-white p-6 shadow-sm">
            {applicationsError ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="rounded-lg bg-red-50 border border-red-200 p-6 max-w-md">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0">
                      <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-red-800 mb-1">
                        Failed to load applications
                      </h3>
                      <p className="text-sm text-red-700">
                        {applicationsError}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setApplicationsError(undefined);
                    fetchApplications(currentJobId).then((result) => {
                      setAllApplications(result.data);
                      setApplicationsError(result.error);
                    });
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Retry
                </button>
              </div>
            ) : (
              <ApplicantsList
                applications={filteredApplications}
                jobId={currentJobId}
                isLoading={isLoading}
                onDecisionUpdate={() => {
                  // Reload applications after decision update
                  fetchApplications(currentJobId).then((result) => {
                    setAllApplications(result.data);
                    setApplicationsError(result.error);
                  });
                }}
              />
            )}
          </div>
        ) : (
          /* Candidate List View */
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
                selectedId={null}
                onSelect={(id) => {
                  // Navigate to candidate profile with jobId
                  router.push(`/employer/dashboard/candidates/profile/${id}?jobId=${currentJobId}`);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
