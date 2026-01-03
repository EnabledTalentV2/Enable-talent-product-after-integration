"use client";

import { useCallback, useState } from "react";
import { apiRequest, getApiErrorMessage, type ApiResult } from "@/lib/api-client";
import type { UserData } from "@/lib/types/user";

export type UpdateCandidateProfilePayload = {
  slug: string;
  data: UserData | FormData | Record<string, unknown>;
  method?: "PUT" | "PATCH";
};

export function useUpdateCandidateProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCandidateProfile = useCallback(
    async ({
      slug,
      data,
      method = "PUT",
    }: UpdateCandidateProfilePayload): Promise<ApiResult<unknown>> => {
      setIsLoading(true);
      setError(null);

      try {
        const body =
          typeof FormData !== "undefined" && data instanceof FormData
            ? data
            : JSON.stringify(data);
        const response = await apiRequest<unknown>(
          `/api/candidates/profiles/${slug}/`,
          {
            method,
            body,
          }
        );
        return { data: response, error: null };
      } catch (err) {
        const message = getApiErrorMessage(
          err,
          "Unable to save your profile. Please try again."
        );
        setError(message);
        return { data: null, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return { updateCandidateProfile, isLoading, error, setError, clearError };
}
