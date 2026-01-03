"use client";

import { useCallback, useState } from "react";
import { apiRequest, getApiErrorMessage, type ApiResult } from "@/lib/api-client";

export type LoginUserPayload = {
  email: string;
  password: string;
  user_type?: string;
};

export function useLoginUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginUser = useCallback(
    async (payload: LoginUserPayload): Promise<ApiResult<unknown>> => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiRequest<unknown>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        return { data, error: null };
      } catch (err) {
        const message = getApiErrorMessage(
          err,
          "Invalid email or password."
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

  return { loginUser, isLoading, error, setError, clearError };
}
