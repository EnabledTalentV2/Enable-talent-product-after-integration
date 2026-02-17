"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUserDataStore } from "@/lib/userDataStore";
import { apiRequest } from "@/lib/api-client";
import { ensureCandidateProfileSlug } from "@/lib/candidateProfile";
import { buildCandidateProfileCorePayload } from "@/lib/candidateProfileUtils";
import {
  pollForParsedData,
  mergeUserData,
  fetchGeneratedAbout,
  type ParseFailureReason,
} from "@/lib/helpers/resumeParser";
import { PARSE_FAILURE_MESSAGE } from "@/lib/constants/accessibilityNeeds";

export type AccessibilityStep = "intro" | "categories" | "preferences" | "accommodations";

export function useAccessibilityNeeds() {
  const router = useRouter();
  const { userData, patchUserData, setUserData } = useUserDataStore();

  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [parseFailure, setParseFailure] = useState<string | null>(null);
  const [parseFailureReason, setParseFailureReason] = useState<ParseFailureReason>(null);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [step, setStep] = useState<AccessibilityStep>("intro");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    userData.accessibilityNeeds?.categories || [],
  );
  const [accommodationNeed, setAccommodationNeed] = useState<string>(
    userData.accessibilityNeeds?.accommodationNeed || "yes",
  );
  const [disclosurePreference, setDisclosurePreference] = useState<string>(
    userData.accessibilityNeeds?.disclosurePreference || "during_application",
  );
  const [selectedAccommodations, setSelectedAccommodations] = useState<string[]>(
    userData.accessibilityNeeds?.accommodations || [],
  );

  // Refs for focus management
  const mainHeadingRef = useRef<HTMLHeadingElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  // Check authentication on mount
  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const response = await fetch("/api/user/me", {
          credentials: "include",
        });

        if (!response.ok) {
          console.log(
            "[Accessibility Needs] Session check failed with status:",
            response.status,
          );
          const returnUrl = encodeURIComponent("/signup/accessability-needs");
          router.replace(`/login-talent?next=${returnUrl}`);
          return;
        }

        const userData = await response.json().catch(() => ({}));

        if (!active) return;

        if (!userData || !userData.email) {
          console.log("[Accessibility Needs] No user data found");
          const returnUrl = encodeURIComponent("/signup/accessability-needs");
          router.replace(`/login-talent?next=${returnUrl}`);
          return;
        }

        console.log("[Accessibility Needs] User authenticated:", userData.email);
        setLoading(false);
      } catch (err) {
        console.error("[Accessibility Needs] Session check error:", err);
        const returnUrl = encodeURIComponent("/signup/accessability-needs");
        router.replace(`/login-talent?next=${returnUrl}`);
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setResumeUploaded(params.get("resumeUploaded") === "1");
  }, []);

  // Announce step changes to screen readers
  useEffect(() => {
    if (mainHeadingRef.current) {
      mainHeadingRef.current.focus();
    }

    const stepMessages: Record<AccessibilityStep, string> = {
      intro: "Step 1 of 4: Accessibility and accommodation preferences (optional)",
      categories: "Step 2 of 4: Disability categories (optional)",
      preferences: "Step 3 of 4: Accommodation needs and disclosure preferences",
      accommodations: "Step 4 of 4: Workplace accommodations (optional)",
    };

    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = stepMessages[step];
    }
  }, [step]);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => {
      if (id === "prefer_not_to_disclose") {
        if (prev.includes(id)) {
          return [];
        }
        return [id];
      }

      if (prev.includes("prefer_not_to_disclose")) {
        return [id];
      }

      return prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id];
    });
  };

  const toggleAccommodation = (id: string) => {
    setSelectedAccommodations((prev) => {
      const isExclusiveOption = id === "prefer_discuss_later" || id === "non_needed";

      if (isExclusiveOption) {
        if (prev.includes(id)) {
          return [];
        }
        return [id];
      }

      if (prev.includes("prefer_discuss_later") || prev.includes("non_needed")) {
        return [id];
      }

      return prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id];
    });
  };

  const handleCompleteProfile = async () => {
    if (isCompleting) return;

    setIsCompleting(true);
    setIsParsingResume(false);
    setParseFailure(null);
    setParseFailureReason(null);

    try {
      const accessibilityPatch = {
        accessibilityNeeds: {
          categories: selectedCategories,
          accommodationNeed: accommodationNeed,
          disclosurePreference: disclosurePreference,
          accommodations: selectedAccommodations,
        },
      };

      patchUserData(accessibilityPatch);

      const slug = await ensureCandidateProfileSlug({
        logLabel: "Accessibility Needs",
      });

      if (!slug) {
        setParseFailure("Unable to save accessibility preferences.");
        return;
      }

      setSavedSlug(slug);

      try {
        const profilePayload = buildCandidateProfileCorePayload({
          ...userData,
          ...accessibilityPatch,
        });
        if (Object.keys(profilePayload).length > 0) {
          await apiRequest(`/api/candidates/profiles/${slug}/`, {
            method: "PATCH",
            body: JSON.stringify(profilePayload),
          });
        }
      } catch (err) {
        console.error("[Accessibility Needs] Failed to update profile:", err);
        setParseFailure("Unable to save accessibility preferences.");
        return;
      }

      if (!resumeUploaded) {
        console.log("[Accessibility Needs] No resume uploaded, skipping to manual entry");
        router.push("/signup/manual-resume-fill");
        return;
      }

      console.log("[Accessibility Needs] Resume was uploaded, triggering parse and polling");
      setIsParsingResume(true);

      try {
        console.log("[Accessibility Needs] Triggering resume parsing via POST");
        await apiRequest(`/api/candidates/profiles/${slug}/parse-resume/`, {
          method: "POST",
        });
        console.log("[Accessibility Needs] Parse-resume POST successful");

        console.log("[Accessibility Needs] Immediately firing GET to start parsing process");
        await apiRequest<unknown>(
          `/api/candidates/profiles/${slug}/parsing-status/?include_resume=true`,
          { method: "GET" },
        );
        console.log("[Accessibility Needs] Initial parsing-status GET successful");
      } catch (err) {
        console.warn("[Accessibility Needs] Parse trigger failed:", err);
      }

      const pollResult = await pollForParsedData(slug, "Accessibility Needs");

      if (pollResult.success && pollResult.data) {
        console.log("[Accessibility Needs] Resume data found, merging into user data");
        const hasAbout =
          userData.basicInfo.currentStatus &&
          userData.basicInfo.currentStatus.trim().length > 0;
        const generatedAbout = hasAbout ? null : await fetchGeneratedAbout();
        setUserData((prev) => {
          const merged = mergeUserData(prev, pollResult.data!);
          if (
            generatedAbout &&
            (!merged.basicInfo.currentStatus || merged.basicInfo.currentStatus.trim().length === 0)
          ) {
            return {
              ...merged,
              basicInfo: {
                ...merged.basicInfo,
                currentStatus: generatedAbout,
              },
            };
          }
          return merged;
        });
        router.push("/signup/manual-resume-fill");
        return;
      }

      console.log(
        "[Accessibility Needs] Resume parsing failed:",
        pollResult.failureReason,
        pollResult.errorMessage,
      );
      setParseFailure(pollResult.errorMessage || PARSE_FAILURE_MESSAGE);
      setParseFailureReason(pollResult.failureReason);
    } finally {
      setIsCompleting(false);
      setIsParsingResume(false);
    }
  };

  const handleRetryParsing = async () => {
    if (isCompleting || !savedSlug) return;

    setIsCompleting(true);
    setIsParsingResume(true);
    setParseFailure(null);
    setParseFailureReason(null);

    try {
      try {
        console.log("[Accessibility Needs] Retry: Triggering resume parsing via POST");
        await apiRequest(`/api/candidates/profiles/${savedSlug}/parse-resume/`, {
          method: "POST",
        });

        console.log("[Accessibility Needs] Retry: Immediately firing GET to start parsing process");
        await apiRequest<unknown>(
          `/api/candidates/profiles/${savedSlug}/parsing-status/?include_resume=true`,
          { method: "GET" },
        );
      } catch (err) {
        console.warn("[Accessibility Needs] Retry: Parse trigger failed:", err);
      }

      const pollResult = await pollForParsedData(savedSlug, "Accessibility Needs");

      if (pollResult.success && pollResult.data) {
        console.log("[Accessibility Needs] Retry successful, merging resume data");
        const hasAbout =
          userData.basicInfo.currentStatus &&
          userData.basicInfo.currentStatus.trim().length > 0;
        const generatedAbout = hasAbout ? null : await fetchGeneratedAbout();
        setUserData((prev) => {
          const merged = mergeUserData(prev, pollResult.data!);
          if (
            generatedAbout &&
            (!merged.basicInfo.currentStatus || merged.basicInfo.currentStatus.trim().length === 0)
          ) {
            return {
              ...merged,
              basicInfo: {
                ...merged.basicInfo,
                currentStatus: generatedAbout,
              },
            };
          }
          return merged;
        });
        router.push("/signup/manual-resume-fill");
        return;
      }

      console.log("[Accessibility Needs] Retry failed:", pollResult.failureReason);
      setParseFailure(pollResult.errorMessage || PARSE_FAILURE_MESSAGE);
      setParseFailureReason(pollResult.failureReason);
    } finally {
      setIsCompleting(false);
      setIsParsingResume(false);
    }
  };

  const handleContinueWithoutParsing = () => {
    router.push("/signup/manual-resume-fill");
  };

  return {
    // State
    loading,
    step,
    selectedCategories,
    accommodationNeed,
    disclosurePreference,
    selectedAccommodations,
    isCompleting,
    isParsingResume,
    parseFailure,
    parseFailureReason,
    // Refs
    mainHeadingRef,
    liveRegionRef,
    // Actions
    setStep,
    toggleCategory,
    toggleAccommodation,
    setAccommodationNeed,
    setDisclosurePreference,
    handleCompleteProfile,
    handleRetryParsing,
    handleContinueWithoutParsing,
  };
}
