"use client";

import { useCallback, useState } from "react";
import { apiRequest, getApiErrorMessage, type ApiResult } from "@/lib/api-client";

export type CareerCoachMessage = {
  input_text: string;
  resume_slug: string;
  thread_id: string | null;
};

export type CareerCoachResponse = {
  output: string;
  thread_id: string;
  resume_slug?: string;
};

export type ResumePromptMessage = {
  input_text: string;
  resume_slug: string;
  thread_id: string | null;
};

export type ResumePromptResponse = {
  output: string;
  thread_id: string;
  resume_slug?: string;
};

export function useCareerCoach() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCareerCoachMessage = useCallback(
    async (
      message: CareerCoachMessage
    ): Promise<ApiResult<CareerCoachResponse>> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiRequest<CareerCoachResponse>(
          "/api/candidates/career-coach/",
          {
            method: "POST",
            body: JSON.stringify(message),
          }
        );
        return { data: response, error: null };
      } catch (err) {
        const errorMessage = getApiErrorMessage(
          err,
          "Failed to send message to career coach. Please try again."
        );
        setError(errorMessage);
        return { data: null, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const sendResumePrompt = useCallback(
    async (
      message: ResumePromptMessage
    ): Promise<ApiResult<ResumePromptResponse>> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiRequest<ResumePromptResponse>(
          "/api/candidates/prompt/",
          {
            method: "POST",
            body: JSON.stringify(message),
          }
        );
        return { data: response, error: null };
      } catch (err) {
        const errorMessage = getApiErrorMessage(
          err,
          "Failed to process resume prompt. Please try again."
        );
        setError(errorMessage);
        return { data: null, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    sendCareerCoachMessage,
    sendResumePrompt,
    isLoading,
    error,
    clearError,
  };
}
