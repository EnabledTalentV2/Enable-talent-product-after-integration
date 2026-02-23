"use client";

import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAIRanking } from "@/lib/hooks/useAIRanking";

interface CandidateRankingPanelProps {
  jobId: string;
  onCandidateSelect?: (candidateIdOrSlug: number | string, applicationId?: number) => void;
}

export default function CandidateRankingPanel({
  jobId,
  onCandidateSelect,
}: CandidateRankingPanelProps) {
  const {
    isRanking,
    rankingStatus,
    rankedCandidates,
    isFetchingRankingData,
    error,
    triggerRanking,
    fetchRankingData,
    clearError,
  } = useAIRanking();

  // Fetch existing ranking data on mount
  useEffect(() => {
    if (jobId) {
      fetchRankingData(jobId);
    }
  }, [jobId, fetchRankingData]);

  const handleTriggerRanking = async () => {
    await triggerRanking(jobId);
  };

  const getScoreColor = (score: number): string => {
    // Normalize score to 0-100 range
    const normalizedScore = score > 1 ? score : score * 100;
    if (normalizedScore >= 80) return "text-green-900";
    if (normalizedScore >= 60) return "text-amber-900";
    return "text-slate-800";
  };

  const getScoreBadge = (score: number, index: number): string | null => {
    // Normalize score to 0-100 range
    const normalizedScore = score > 1 ? score : score * 100;
    if (index === 0 && normalizedScore >= 90) return "🥇 Best Match";
    if (index === 1 && normalizedScore >= 80) return "🥈 Great Match";
    if (index === 2 && normalizedScore >= 70) return "🥉 Good Match";
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>✨</span>
            <span><abbr title="Artificial Intelligence">AI</abbr> Candidate Ranking</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Let <abbr title="Artificial Intelligence">AI</abbr> analyze and rank candidates based on job requirements
          </p>
        </div>
        <div className="flex items-center gap-3 sm:ml-auto">
          {isFetchingRankingData && !isRanking && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading ranking data...
          </div>
          )}
          <button
          onClick={handleTriggerRanking}
          disabled={isRanking}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isRanking
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isRanking ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Ranking...
            </span>
          ) : (
            "Rank Candidates"
          )}
        </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between">
          <div className="flex items-start gap-2">
            <span className="text-red-800 text-xl">⚠️</span>
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
          <button
            onClick={clearError}
            className="text-red-800 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading State */}
      {isRanking && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-pulse space-y-4 w-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <p className="mt-6 text-gray-600">
            AI is analyzing candidates... This may take up to 60 seconds.
          </p>
        </div>
      )}

      {!isRanking && isFetchingRankingData && (
        <div className="flex items-center justify-center gap-2 py-12 text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading ranking data...
        </div>
      )}

      {/* Ranked Candidates List */}
      {!isRanking && rankedCandidates.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            Found {rankedCandidates.length} ranked candidate
            {rankedCandidates.length !== 1 ? "s" : ""}
          </p>
          {rankedCandidates.map((candidate, index) => {
            // Handle both formats: decimal (0.0-1.0) and percentage (0-100)
            const scorePercent = candidate.score > 1
              ? Math.round(candidate.score)
              : Math.round(candidate.score * 100);
            const badge = getScoreBadge(candidate.score, index);

            return (
              <button
                type="button"
                key={candidate.candidate_id}
                className="w-full border border-gray-200 rounded-lg p-4 text-left hover:border-blue-300 hover:shadow-md transition-all"
                onClick={() => onCandidateSelect?.(candidate.candidate_slug || candidate.candidate_id, candidate.application_id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-semibold text-gray-700">
                        #{index + 1}
                      </span>
                      <span className="text-sm text-gray-500">
                        Candidate ID: {candidate.candidate_id}
                      </span>
                      {badge && (
                        <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded">
                          {badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Match Reason:</span>{" "}
                      {candidate.match_reason ||
                        (candidate.reasons?.length
                          ? candidate.reasons.join(" ")
                          : "Not available")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end ml-4">
                    <div
                      className={`text-3xl font-bold ${getScoreColor(
                        candidate.score
                      )}`}
                    >
                      {scorePercent}%
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${
                          scorePercent >= 80
                            ? "bg-green-500"
                            : scorePercent >= 60
                            ? "bg-yellow-500"
                            : "bg-gray-400"
                        }`}
                        style={{ width: `${scorePercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isRanking &&
        !isFetchingRankingData &&
        rankedCandidates.length === 0 &&
        rankingStatus === "not_started" && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Ranking Yet
            </h3>
            <p className="text-gray-600 mb-4">
              No ranking data yet. Click &quot;Rank Candidates&quot; to generate the list.
            </p>
          </div>
        )}

      {/* No Candidates State */}
      {!isRanking &&
        !isFetchingRankingData &&
        rankedCandidates.length === 0 &&
        rankingStatus === "completed" && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Candidates Found
            </h3>
            <p className="text-gray-600">
              There are no candidates available for ranking at this time.
            </p>
          </div>
        )}
    </div>
  );
}
