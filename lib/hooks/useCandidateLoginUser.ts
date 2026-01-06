"use client";

import { useCallback } from "react";
import { useLoginUser, type LoginUserPayload } from "@/lib/hooks/useLoginUser";
import type { ApiResult } from "@/lib/api-client";

export type CandidateLoginPayload = LoginUserPayload;

export function useCandidateLoginUser() {
  const { loginUser, isLoading, error, setError, clearError } = useLoginUser();

  const loginCandidate = useCallback(
    (payload: CandidateLoginPayload): Promise<ApiResult<unknown>> =>
      loginUser(payload),
    [loginUser]
  );

  return { loginCandidate, isLoading, error, setError, clearError };
}
