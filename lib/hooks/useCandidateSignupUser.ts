"use client";

import { useCallback } from "react";
import {
  useSignupUser,
  type SignupUserPayload,
} from "@/lib/hooks/useSignupUser";
import type { ApiResult } from "@/lib/api-client";

export type CandidateSignupPayload = Omit<
  SignupUserPayload,
  "role" | "user_type" | "fullName" | "employerName"
>;

export function useCandidateSignupUser() {
  const { signupUser, isLoading, error, setError, clearError } =
    useSignupUser();

  const signupCandidate = useCallback(
    (payload: CandidateSignupPayload): Promise<ApiResult<unknown>> =>
      signupUser({ ...payload, user_type: "candidate" }),
    [signupUser]
  );

  return { signupCandidate, isLoading, error, setError, clearError };
}
