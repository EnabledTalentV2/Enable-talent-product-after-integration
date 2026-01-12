"use client";

import { useCallback, useState } from "react";
import {
  apiRequest,
  getApiErrorMessage,
  type ApiResult,
} from "@/lib/api-client";
import type {
  CandidateDecisionStatus,
  CandidateDecisionRequest,
  CandidateDecisionResponse,
  DecisionActionParams,
} from "@/lib/types/candidate-decision";

export function useCandidateDecision() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Update candidate application decision
   */
  const updateDecision = useCallback(
    async ({
      jobId,
      applicationId,
      status,
    }: DecisionActionParams): Promise<
      ApiResult<CandidateDecisionResponse>
    > => {
      setIsUpdating(true);
      setError(null);

      try {
        const payload: CandidateDecisionRequest = { status };

        console.log(
          `[useCandidateDecision] Updating decision for application ${applicationId} to ${status}`
        );

        const response = await apiRequest<CandidateDecisionResponse>(
          `/api/jobs/${jobId}/applications/${applicationId}/decision`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        console.log(
          "[useCandidateDecision] Decision updated successfully:",
          response
        );

        return { data: response, error: null };
      } catch (err) {
        const errorMessage = getApiErrorMessage(
          err,
          "Failed to update candidate decision. Please try again."
        );
        setError(errorMessage);
        return { data: null, error: errorMessage };
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  /**
   * Shortlist a candidate
   */
  const shortlistCandidate = useCallback(
    async (jobId: string, applicationId: string) => {
      return updateDecision({ jobId, applicationId, status: "shortlisted" });
    },
    [updateDecision]
  );

  /**
   * Reject a candidate
   */
  const rejectCandidate = useCallback(
    async (jobId: string, applicationId: string) => {
      return updateDecision({ jobId, applicationId, status: "rejected" });
    },
    [updateDecision]
  );

  /**
   * Hire a candidate
   */
  const hireCandidate = useCallback(
    async (jobId: string, applicationId: string) => {
      return updateDecision({ jobId, applicationId, status: "hired" });
    },
    [updateDecision]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => setError(null), []);

  return {
    isUpdating,
    error,
    updateDecision,
    shortlistCandidate,
    rejectCandidate,
    hireCandidate,
    clearError,
  };
}
