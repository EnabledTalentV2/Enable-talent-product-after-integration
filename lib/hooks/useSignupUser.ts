"use client";

import { useCallback, useState } from "react";
import { apiRequest, getApiErrorMessage, type ApiResult } from "@/lib/api-client";

export type SignupUserPayload = {
  email: string;
  password: string;
  confirm_password: string;
  newsletter?: boolean;
  invite_code?: string;
};

export function useSignupUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signupUser = useCallback(
    async (payload: SignupUserPayload): Promise<ApiResult<unknown>> => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiRequest<unknown>("/api/auth/signup", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        return { data, error: null };
      } catch (err) {
        const message = getApiErrorMessage(
          err,
          "Signup failed. Please try again."
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

  return { signupUser, isLoading, error, setError, clearError };
}
