"use client";

import { useCallback, useState } from "react";
import {
  apiRequest,
  getApiErrorMessage,
  isApiError,
  type ApiResult,
} from "@/lib/api-client";
import type {
  TriggerRankingResponse,
  RankingDataResponse,
  RankedCandidate,
  RankingStatus,
} from "@/lib/types/ai-features";

const POLLING_INTERVAL_MS = 2000; // Poll every 2 seconds
const MAX_POLLING_ATTEMPTS = 30; // 60 seconds total

export function useAIRanking() {
  const [isRanking, setIsRanking] = useState(false);
  const [rankingStatus, setRankingStatus] =
    useState<RankingStatus>("not_started");
  const [rankedCandidates, setRankedCandidates] = useState<RankedCandidate[]>(
    []
  );
  const [isFetchingRankingData, setIsFetchingRankingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Trigger AI ranking for a specific job
   */
  const triggerRanking = useCallback(
    async (jobId: string): Promise<ApiResult<TriggerRankingResponse>> => {
      setIsRanking(true);
      setError(null);
      setRankingStatus("ranking");

      try {
        const response = await apiRequest<TriggerRankingResponse>(
          `/api/jobs/${jobId}/rank-candidates`,
          {
            method: "POST",
            body: JSON.stringify({}),
          }
        );

        console.log(
          "[useAIRanking] Ranking triggered successfully:",
          response
        );

        // If we got a task ID, start polling
        if (response.task_id) {
          pollRankingCompletion(jobId, response.task_id);
        } else if (response.ranking_status === "ranking") {
          // Fallback polling when backend doesn't return a task ID
          pollRankingCompletion(jobId, "");
        } else {
          // If no task ID, fetch ranking data immediately
          await fetchRankingData(jobId);
          setIsRanking(false);
        }

        return { data: response, error: null };
      } catch (err) {
        const errorMessage = getApiErrorMessage(
          err,
          "Failed to trigger candidate ranking. Please try again."
        );
        setError(errorMessage);
        setIsRanking(false);
        setRankingStatus("failed");
        return { data: null, error: errorMessage };
      }
    },
    []
  );

  /**
   * Poll for ranking completion
   */
  const pollRankingCompletion = useCallback(
    async (jobId: string, taskId: string) => {
      let attempts = 0;

      const poll = async () => {
        if (attempts >= MAX_POLLING_ATTEMPTS) {
          console.warn(
            "[useAIRanking] Polling timeout - max attempts reached"
          );
          setError(
            "Ranking is taking longer than expected. Please refresh to check status."
          );
          setIsRanking(false);
          setRankingStatus("failed");
          return;
        }

        attempts++;
        console.log(
          `[useAIRanking] Polling attempt ${attempts}/${MAX_POLLING_ATTEMPTS}`
        );

        try {
          const result = await fetchRankingData(jobId);

          // Check if ranking is complete
          if (
            result.data?.ranking_status === "completed" ||
            (result.data?.ranked_candidates &&
              result.data.ranked_candidates.length > 0)
          ) {
            console.log("[useAIRanking] Ranking completed successfully");
            setIsRanking(false);
            setRankingStatus("completed");
            return;
          }

          if (result.data?.ranking_status === "failed") {
            console.error("[useAIRanking] Ranking failed");
            setIsRanking(false);
            setRankingStatus("failed");
            setError("Ranking failed. Please try again.");
            return;
          }

          // Continue polling
          setTimeout(poll, POLLING_INTERVAL_MS);
        } catch (err) {
          console.error("[useAIRanking] Polling error:", err);
          setTimeout(poll, POLLING_INTERVAL_MS);
        }
      };

      // Start polling
      setTimeout(poll, POLLING_INTERVAL_MS);
    },
    []
  );

  /**
   * Fetch ranking data for a specific job
   */
  const fetchRankingData = useCallback(
    async (jobId: string): Promise<ApiResult<RankingDataResponse>> => {
      setIsFetchingRankingData(true);
      try {
        const response = await apiRequest<RankingDataResponse>(
          `/api/jobs/${jobId}/ranking-data`,
          {
            method: "GET",
          }
        );

        console.log("[useAIRanking] Ranking data fetched:", response);
        console.log("[useAIRanking] First candidate:", response.ranked_candidates?.[0]);

        if (response.ranked_candidates) {
          setRankedCandidates(response.ranked_candidates);
        }

        if (response.ranking_status) {
          setRankingStatus(response.ranking_status);
        }

        setIsFetchingRankingData(false);
        return { data: response, error: null };
      } catch (err) {
        if (isApiError(err) && err.status === 404) {
          setRankedCandidates([]);
          setRankingStatus("not_started");
          setError(null);
          setIsFetchingRankingData(false);
          return {
            data: { ranked_candidates: [], ranking_status: "not_started" },
            error: null,
          };
        }
        const errorMessage = getApiErrorMessage(
          err,
          "Failed to fetch ranking data. Please try again."
        );
        setError(errorMessage);
        setIsFetchingRankingData(false);
        return { data: null, error: errorMessage };
      }
    },
    []
  );

  /**
   * Clear ranking data and reset state
   */
  const clearRanking = useCallback(() => {
    setRankedCandidates([]);
    setError(null);
    setRankingStatus("not_started");
    setIsRanking(false);
    setIsFetchingRankingData(false);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => setError(null), []);

  return {
    isRanking,
    rankingStatus,
    rankedCandidates,
    isFetchingRankingData,
    error,
    triggerRanking,
    fetchRankingData,
    clearRanking,
    clearError,
  };
}
