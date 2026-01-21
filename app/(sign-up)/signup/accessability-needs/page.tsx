"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useUserDataStore } from "@/lib/userDataStore";
import Navbar from "@/components/signup/Navbar";
import { apiRequest } from "@/lib/api-client";
import { ensureCandidateProfileSlug } from "@/lib/candidateProfile";
import { transformBackendResumeData } from "@/lib/transformers/resumeData.transformer";
import { buildCandidateProfileCorePayload } from "@/lib/candidateProfileUtils";
import type { UserData } from "@/lib/types/user";

const categories = [
  {
    id: "physical",
    title: "Physical Disability",
    description:
      "Includes mobility impairments, chronic pain, and physical limitations",
  },
  {
    id: "sensory",
    title: "Sensory Disability",
    description: "Includes vision and hearing impairments",
  },
  {
    id: "neurodevelopmental",
    title: "Neurodevelopmental",
    description: "Includes ADHD, autism spectrum, and learning disabilities",
  },
  {
    id: "mental_health",
    title: "Mental Health",
    description:
      "Includes anxiety, depression, and other mental health conditions",
  },
  {
    id: "intellectual",
    title: "Intellectual Disability",
    description: "Includes developmental and cognitive disabilities",
  },
  {
    id: "acquired",
    title: "Acquired Disability",
    description:
      "Includes traumatic brain injury, stroke, and other acquired conditions",
  },
  {
    id: "chronic",
    title: "Chronic Health Condition",
    description:
      "Includes mobility impairments, chronic pain, and physical limitations",
  },
  {
    id: "other",
    title: "Other Disability",
    description: "Any disability not covered in the categories above",
  },
  {
    id: "prefer_not_to_disclose",
    title: "Prefer not to disclose",
    description: "",
  },
];

const accommodationOptions = [
  { id: "flexible_schedule", label: "Flexible schedule" },
  { id: "remote_work", label: "Remote work" },
  { id: "assistive_tech", label: "Assistive technology" },
  { id: "accessible_workspace", label: "Accessible workspace" },
  { id: "flexible_deadlines", label: "Flexible deadlines" },
  { id: "support_person", label: "Support person" },
  { id: "other", label: "Other" },
  { id: "non_needed", label: "Non needed" },
  { id: "prefer_discuss_later", label: "Prefer to discuss later" },
];

// Helper functions for parsing status check
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getParsingStatus = (payload: unknown): string | null => {
  if (!isRecord(payload)) return null;
  const status =
    (typeof payload.status === "string" && payload.status) ||
    (typeof payload.state === "string" && payload.state) ||
    (typeof payload.parsing_status === "string" && payload.parsing_status) ||
    (typeof payload.parsingStatus === "string" && payload.parsingStatus) ||
    null;
  return status ? status.toLowerCase() : null;
};

type UserDataPatch = {
  basicInfo?: Partial<UserData["basicInfo"]>;
  education?: Partial<UserData["education"]>;
  workExperience?: Partial<UserData["workExperience"]>;
  skills?: Partial<UserData["skills"]>;
  projects?: Partial<UserData["projects"]>;
  achievements?: Partial<UserData["achievements"]>;
  certification?: Partial<UserData["certification"]>;
  preference?: Partial<UserData["preference"]>;
  otherDetails?: Partial<UserData["otherDetails"]>;
  reviewAgree?: Partial<UserData["reviewAgree"]>;
};

const PARSE_FAILURE_MESSAGE =
  "Something went wrong with resume parsing.";
const PARSE_TIMEOUT_MESSAGE =
  "Resume parsing is taking longer than expected. You can retry or continue with manual entry.";
const PARSING_POLL_DELAY_MS = 1500; // 1.5 seconds between attempts
const PARSING_MAX_ATTEMPTS = 20; // Max 20 attempts (30 seconds total)

type ParseFailureReason = "timeout" | "error" | "no_data" | null;

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const extractUserDataPatch = (payload: unknown): UserDataPatch => {
  console.log("[extractUserDataPatch] Input payload:", payload);

  if (!isRecord(payload)) {
    console.log("[extractUserDataPatch] Payload is not a record");
    return {};
  }

  const candidate =
    (isRecord(payload.resume) && payload.resume) ||
    (isRecord(payload.data) && payload.data) ||
    (isRecord(payload.parsed_data) && payload.parsed_data) ||
    (isRecord(payload.parsedData) && payload.parsedData) ||
    (isRecord(payload.resume_data) && payload.resume_data) ||
    (isRecord(payload.resumeData) && payload.resumeData) ||
    (isRecord(payload.userData) && payload.userData) ||
    payload;

  console.log("[extractUserDataPatch] Candidate extracted:", candidate);

  if (!isRecord(candidate)) {
    console.log("[extractUserDataPatch] Candidate is not a record");
    return {};
  }

  const patch: UserDataPatch = {};

  if (isRecord(candidate.basicInfo))
    patch.basicInfo = candidate.basicInfo as Partial<UserData["basicInfo"]>;
  if (isRecord(candidate.education))
    patch.education = candidate.education as Partial<UserData["education"]>;
  if (isRecord(candidate.workExperience))
    patch.workExperience = candidate.workExperience as Partial<
      UserData["workExperience"]
    >;
  if (isRecord(candidate.skills))
    patch.skills = candidate.skills as Partial<UserData["skills"]>;
  if (isRecord(candidate.projects))
    patch.projects = candidate.projects as Partial<UserData["projects"]>;
  if (isRecord(candidate.achievements))
    patch.achievements = candidate.achievements as Partial<
      UserData["achievements"]
    >;
  if (isRecord(candidate.certification))
    patch.certification = candidate.certification as Partial<
      UserData["certification"]
    >;
  if (isRecord(candidate.preference))
    patch.preference = candidate.preference as Partial<UserData["preference"]>;
  if (isRecord(candidate.otherDetails))
    patch.otherDetails = candidate.otherDetails as Partial<
      UserData["otherDetails"]
    >;
  if (isRecord(candidate.reviewAgree))
    patch.reviewAgree = candidate.reviewAgree as UserData["reviewAgree"];

  const resumeData =
    (isRecord(payload.resume) && payload.resume) ||
    (isRecord(payload.resume_data) && payload.resume_data) ||
    (isRecord(payload.resumeData) && payload.resumeData) ||
    (isRecord(candidate.resume_data) && candidate.resume_data) ||
    (isRecord(candidate.resumeData) && candidate.resumeData) ||
    (!("basicInfo" in candidate) &&
    (typeof candidate.name === "string" ||
      typeof candidate.email === "string" ||
      Array.isArray(candidate.skills) ||
      typeof candidate.skills === "string")
      ? candidate
      : null);

  console.log("[extractUserDataPatch] Resume data found:", resumeData);

  if (resumeData) {
    console.log("[extractUserDataPatch] Transforming backend resume data...");
    const transformedData = transformBackendResumeData(resumeData);
    console.log("[extractUserDataPatch] Transformed data:", transformedData);

    if (transformedData.basicInfo && Object.keys(patch.basicInfo || {}).length === 0) {
      patch.basicInfo = transformedData.basicInfo;
    }
    if (transformedData.education && Object.keys(patch.education || {}).length === 0) {
      patch.education = transformedData.education;
    }
    if (transformedData.workExperience && Object.keys(patch.workExperience || {}).length === 0) {
      patch.workExperience = transformedData.workExperience;
    }
    if (transformedData.skills && Object.keys(patch.skills || {}).length === 0) {
      patch.skills = transformedData.skills;
    }
    if (transformedData.projects && Object.keys(patch.projects || {}).length === 0) {
      patch.projects = transformedData.projects;
    }
    if (transformedData.achievements && Object.keys(patch.achievements || {}).length === 0) {
      patch.achievements = transformedData.achievements;
    }
    if (transformedData.certification && Object.keys(patch.certification || {}).length === 0) {
      patch.certification = transformedData.certification;
    }
    if (transformedData.otherDetails && Object.keys(patch.otherDetails || {}).length === 0) {
      patch.otherDetails = transformedData.otherDetails;
    }
  }

  console.log("[extractUserDataPatch] Final patch to return:", patch);
  console.log("[extractUserDataPatch] Patch has keys:", Object.keys(patch));

  return patch;
};

const mergeUserData = (prev: UserData, patch: UserDataPatch): UserData => ({
  ...prev,
  basicInfo: patch.basicInfo
    ? { ...prev.basicInfo, ...patch.basicInfo }
    : prev.basicInfo,
  education: patch.education
    ? { ...prev.education, ...patch.education }
    : prev.education,
  workExperience: patch.workExperience
    ? { ...prev.workExperience, ...patch.workExperience }
    : prev.workExperience,
  skills: patch.skills ? { ...prev.skills, ...patch.skills } : prev.skills,
  projects: patch.projects
    ? { ...prev.projects, ...patch.projects }
    : prev.projects,
  achievements: patch.achievements
    ? { ...prev.achievements, ...patch.achievements }
    : prev.achievements,
  certification: patch.certification
    ? { ...prev.certification, ...patch.certification }
    : prev.certification,
  preference: patch.preference
    ? { ...prev.preference, ...patch.preference }
    : prev.preference,
  otherDetails: patch.otherDetails
    ? { ...prev.otherDetails, ...patch.otherDetails }
    : prev.otherDetails,
  reviewAgree: patch.reviewAgree
    ? { ...prev.reviewAgree, ...patch.reviewAgree }
    : prev.reviewAgree,
});

type PollResult = {
  success: boolean;
  data: UserDataPatch | null;
  failureReason: ParseFailureReason;
  errorMessage?: string;
};

const pollForParsedData = async (
  slug: string
): Promise<PollResult> => {
  console.log(
    `[Accessibility Needs] Starting to poll parsing-status endpoint (max ${PARSING_MAX_ATTEMPTS} attempts, ${PARSING_MAX_ATTEMPTS * PARSING_POLL_DELAY_MS / 1000}s timeout)`
  );

  for (let attempt = 0; attempt < PARSING_MAX_ATTEMPTS; attempt += 1) {
    try {
      // Poll the parsing-status endpoint with include_resume parameter
      const response = await apiRequest<unknown>(
        `/api/candidates/profiles/${slug}/parsing-status/?include_resume=true`,
        { method: "GET" }
      );

      console.log(
        `[Accessibility Needs] Parsing status (attempt ${attempt + 1}/${PARSING_MAX_ATTEMPTS}):`,
        response
      );

      // Check parsing status
      if (isRecord(response)) {
        const status = String(response.parsing_status || "").toLowerCase();

        // Status: parsed - resume parsing completed successfully
        if (status === "parsed") {
          console.log("[Accessibility Needs] Resume parsing completed!");
          console.log("[Accessibility Needs] Full response:", response);

          const patch = extractUserDataPatch(response);
          console.log("[Accessibility Needs] Extracted patch:", patch);
          console.log("[Accessibility Needs] Patch keys:", Object.keys(patch));

          if (Object.keys(patch).length > 0) {
            console.log("[Accessibility Needs] Extracted resume data:", patch);
            return { success: true, data: patch, failureReason: null };
          }

          console.warn("[Accessibility Needs] Status is 'parsed' but no data found");
          console.warn("[Accessibility Needs] Response structure:", JSON.stringify(response, null, 2));
          return {
            success: false,
            data: null,
            failureReason: "no_data",
            errorMessage: "Resume was processed but no data could be extracted. The file may be corrupted or in an unsupported format."
          };
        }

        // Status: failed - resume parsing failed
        if (status === "failed" || status === "error") {
          const errorMsg = String(response.error || response.message || PARSE_FAILURE_MESSAGE);
          console.error(
            `[Accessibility Needs] Parsing ${status}:`,
            errorMsg
          );
          return {
            success: false,
            data: null,
            failureReason: "error",
            errorMessage: errorMsg
          };
        }

        // Status: parsing - still processing, continue polling
        if (status === "parsing") {
          console.log(
            `[Accessibility Needs] Still parsing... (attempt ${attempt + 1}/${PARSING_MAX_ATTEMPTS})`
          );
          // Continue to next iteration
        } else {
          // Unknown status
          console.warn(
            `[Accessibility Needs] Unknown parsing status: "${status}"`
          );
        }
      }
    } catch (err) {
      console.warn(
        `[Accessibility Needs] Parsing status poll error (attempt ${attempt + 1}):`,
        err
      );

      // On last attempt, return error
      if (attempt === PARSING_MAX_ATTEMPTS - 1) {
        return {
          success: false,
          data: null,
          failureReason: "error",
          errorMessage: err instanceof Error ? err.message : PARSE_FAILURE_MESSAGE
        };
      }
    }

    // Wait before next poll (except on last attempt)
    if (attempt < PARSING_MAX_ATTEMPTS - 1) {
      await sleep(PARSING_POLL_DELAY_MS);
    }
  }

  console.log(
    `[Accessibility Needs] Polling timed out after ${PARSING_MAX_ATTEMPTS} attempts (${PARSING_MAX_ATTEMPTS * PARSING_POLL_DELAY_MS / 1000}s)`
  );
  return {
    success: false,
    data: null,
    failureReason: "timeout",
    errorMessage: PARSE_TIMEOUT_MESSAGE
  };
};

export default function AccessabilityNeedsPage() {
  const router = useRouter();
  const { userData, patchUserData } = useUserDataStore();
  const setUserData = useUserDataStore((s) => s.setUserData);

  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [parseFailure, setParseFailure] = useState<string | null>(null);
  const [parseFailureReason, setParseFailureReason] = useState<ParseFailureReason>(null);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [step, setStep] = useState<
    "intro" | "categories" | "preferences" | "accommodations"
  >("intro");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    userData.accessibilityNeeds?.categories || []
  );
  const [accommodationNeed, setAccommodationNeed] = useState<string>(
    userData.accessibilityNeeds?.accommodationNeed || "yes"
  );
  const [disclosurePreference, setDisclosurePreference] = useState<string>(
    userData.accessibilityNeeds?.disclosurePreference || "during_application"
  );
  const [selectedAccommodations, setSelectedAccommodations] = useState<
    string[]
  >(userData.accessibilityNeeds?.accommodations || []);

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
            response.status
          );
          const returnUrl = encodeURIComponent("/signup/accessability-needs");
          router.replace(`/login-talent?returnUrl=${returnUrl}`);
          return;
        }

        const userData = await response.json().catch(() => ({}));

        if (!active) return;

        // Verify user is authenticated
        if (!userData || !userData.email) {
          console.log("[Accessibility Needs] No user data found");
          const returnUrl = encodeURIComponent("/signup/accessability-needs");
          router.replace(`/login-talent?returnUrl=${returnUrl}`);
          return;
        }

        console.log("[Accessibility Needs] User authenticated:", userData.email);
        setLoading(false);
      } catch (err) {
        console.error("[Accessibility Needs] Session check error:", err);
        const returnUrl = encodeURIComponent("/signup/accessability-needs");
        router.replace(`/login-talent?returnUrl=${returnUrl}`);
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

    // Announce step to screen readers
    const stepMessages: Record<typeof step, string> = {
      intro: "Step 1 of 4: Introduction to voluntary self-identification",
      categories: "Step 2 of 4: Select disability categories that apply",
      preferences: "Step 3 of 4: Accommodation needs and disclosure preferences",
      accommodations: "Step 4 of 4: Select workplace accommodations"
    };

    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = stepMessages[step];
    }
  }, [step]);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleAccommodation = (id: string) => {
    setSelectedAccommodations((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // Save accessibility data, check parsing status, and navigate to manual resume fill
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

      // Save to user data store (persisted in localStorage)
      patchUserData(accessibilityPatch);

      // Get candidate slug for API calls
      const slug = await ensureCandidateProfileSlug({
        logLabel: "Accessibility Needs",
      });

      if (!slug) {
        setParseFailure("Unable to save accessibility preferences.");
        return;
      }

      // Save slug for retry functionality
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

      // If resume was uploaded, poll the parsing-status endpoint for resume_data
      // Polls GET /api/candidates/profiles/{slug}/parsing-status/?include_resume=true
      // Max 20 attempts × 1.5s = 30 seconds timeout
      if (!resumeUploaded) {
        console.log("[Accessibility Needs] No resume uploaded, skipping to manual entry");
        router.push("/signup/manual-resume-fill");
        return;
      }

      console.log("[Accessibility Needs] Resume was uploaded, triggering parse and polling");
      setIsParsingResume(true);

      // Step 1: Trigger parsing via POST to parse-resume endpoint
      try {
        console.log("[Accessibility Needs] Triggering resume parsing via POST");
        await apiRequest(`/api/candidates/profiles/${slug}/parse-resume/`, {
          method: "POST",
        });
        console.log("[Accessibility Needs] Parse-resume POST successful");

        // Step 2: Immediately fire GET to start the parsing process (backend requires this)
        console.log("[Accessibility Needs] Immediately firing GET to start parsing process");
        await apiRequest<unknown>(
          `/api/candidates/profiles/${slug}/parsing-status/?include_resume=true`,
          { method: "GET" }
        );
        console.log("[Accessibility Needs] Initial parsing-status GET successful");
      } catch (err) {
        console.warn("[Accessibility Needs] Parse trigger failed:", err);
        // Continue anyway - parsing might have been triggered earlier
      }

      // Step 3: Poll the parsing-status endpoint for resume_data
      const pollResult = await pollForParsedData(slug);

      if (pollResult.success && pollResult.data) {
        console.log("[Accessibility Needs] Resume data found, merging into user data");
        setUserData((prev) => mergeUserData(prev, pollResult.data!));
        router.push("/signup/manual-resume-fill");
        return;
      }

      // Parsing failed - show the failure UI and let user choose
      console.log(
        "[Accessibility Needs] Resume parsing failed:",
        pollResult.failureReason,
        pollResult.errorMessage
      );
      setParseFailure(pollResult.errorMessage || PARSE_FAILURE_MESSAGE);
      setParseFailureReason(pollResult.failureReason);
      // Don't navigate - let user choose to retry or continue
    } finally {
      setIsCompleting(false);
      setIsParsingResume(false);
    }
  };

  // Retry polling for parsed data (after a failure)
  const handleRetryParsing = async () => {
    if (isCompleting || !savedSlug) return;

    setIsCompleting(true);
    setIsParsingResume(true);
    setParseFailure(null);
    setParseFailureReason(null);

    try {
      // Re-trigger parsing via POST, then immediately GET to start parsing
      try {
        console.log("[Accessibility Needs] Retry: Triggering resume parsing via POST");
        await apiRequest(`/api/candidates/profiles/${savedSlug}/parse-resume/`, {
          method: "POST",
        });

        // Immediately fire GET to start parsing process
        console.log("[Accessibility Needs] Retry: Immediately firing GET to start parsing process");
        await apiRequest<unknown>(
          `/api/candidates/profiles/${savedSlug}/parsing-status/?include_resume=true`,
          { method: "GET" }
        );
      } catch (err) {
        console.warn("[Accessibility Needs] Retry: Parse trigger failed:", err);
      }

      const pollResult = await pollForParsedData(savedSlug);

      if (pollResult.success && pollResult.data) {
        console.log("[Accessibility Needs] Retry successful, merging resume data");
        setUserData((prev) => mergeUserData(prev, pollResult.data!));
        router.push("/signup/manual-resume-fill");
        return;
      }

      // Still failed
      console.log("[Accessibility Needs] Retry failed:", pollResult.failureReason);
      setParseFailure(pollResult.errorMessage || PARSE_FAILURE_MESSAGE);
      setParseFailureReason(pollResult.failureReason);
    } finally {
      setIsCompleting(false);
      setIsParsingResume(false);
    }
  };

  // Continue to manual entry without parsed data
  const handleContinueWithoutParsing = () => {
    router.push("/signup/manual-resume-fill");
  };

  // Show loading state during authentication check
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F5FA]">
        <div className="text-slate-500">Verifying session...</div>
      </div>
    );
  }

  if (step === "intro") {
    return (
      <div className="flex min-h-screen flex-col bg-[#F0F5FA] text-slate-900">
        {/* Navbar */}
        <Navbar />

        {/* Screen reader announcements */}
        <div
          ref={liveRegionRef}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />

        {/* Main */}
        <main
          className="flex flex-1 items-center justify-center px-6 pb-12 pt-4 md:px-12"
          role="main"
          aria-labelledby="intro-heading"
        >
          <div className="w-full max-w-4xl rounded-[28px] bg-white p-8 text-center shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] md:rounded-[32px] md:p-14">
            <h1
              id="intro-heading"
              ref={mainHeadingRef}
              tabIndex={-1}
              className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl focus:outline-none"
            >
              Voluntary Self-Identification
            </h1>

            <p className="mt-3 text-lg text-slate-500">
              This information helps employers support diversity and inclusion
              initiatives
            </p>

            <p className="mt-16 text-lg font-bold text-slate-900" role="note">
              All information provided will be kept confidential
            </p>

            <button
              onClick={() => setStep("categories")}
              className="mt-8 rounded-xl bg-[#C78539] px-12 py-3 text-lg font-semibold text-white transition-colors hover:bg-[#b07430] focus:outline-none focus:ring-2 focus:ring-[#C78539] focus:ring-offset-2"
              aria-label="Begin voluntary self-identification form"
            >
              Create Now
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (step === "categories") {
    return (
      <div className="flex min-h-screen flex-col bg-[#F0F5FA] text-slate-900">
        {/* Navbar */}
        <Navbar />

        {/* Screen reader announcements */}
        <div
          ref={liveRegionRef}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />

        {/* Main */}
        <main
          className="flex flex-1 items-center justify-center px-6 pb-12 pt-4 md:px-12"
          role="main"
          aria-labelledby="categories-heading"
        >
          <div className="w-full max-w-6xl rounded-[28px] bg-white p-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] md:rounded-[32px] md:p-14">
          <h1
            id="categories-heading"
            ref={mainHeadingRef}
            tabIndex={-1}
            className="mb-2 text-2xl font-bold text-slate-900 md:text-3xl focus:outline-none"
          >
            Please select any categories that apply to you:
          </h1>

          <p id="categories-description" className="mb-8 text-sm font-medium text-slate-700">
            Important Note: You may select multiple categories that apply to you.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); setStep("preferences"); }}>
            <fieldset>
              <legend className="sr-only">Disability categories (select all that apply)</legend>
              <div
                className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                role="group"
                aria-describedby="categories-description"
              >
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      aria-pressed={isSelected}
                      aria-label={`${category.title}. ${category.description || ''}`}
                      className={`relative flex min-h-[160px] flex-col items-start justify-between rounded-xl p-6 text-left transition-all focus:outline-none focus:ring-2 focus:ring-[#C78539] focus:ring-offset-2 ${
                        isSelected
                          ? "bg-[#E6F4EA] ring-2 ring-[#34A853]"
                          : "bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex w-full items-start justify-between">
                        <span className="text-lg font-bold text-slate-900">
                          {category.title}
                        </span>
                        <div
                          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                            isSelected ? "bg-[#34A853] text-white" : "bg-slate-200"
                          }`}
                          aria-hidden="true"
                        >
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                      </div>
                      {category.description && (
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                          {category.description}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <nav className="mt-8 flex items-center justify-between" aria-label="Form navigation">
              <button
                type="button"
                onClick={() => setStep("intro")}
                className="rounded-xl border border-slate-300 bg-white px-8 py-3 text-lg font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                aria-label="Go back to introduction"
              >
                Back
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#C78539] px-12 py-3 text-lg font-semibold text-white transition-colors hover:bg-[#b07430] focus:outline-none focus:ring-2 focus:ring-[#C78539] focus:ring-offset-2"
                aria-label="Continue to accommodation preferences"
              >
                Next
              </button>
            </nav>
          </form>
          </div>
        </main>
      </div>
    );
  }

  if (step === "preferences") {
    return (
      <div className="flex min-h-screen flex-col bg-[#F0F5FA] text-slate-900">
        {/* Navbar */}
        <Navbar />

        {/* Screen reader announcements */}
        <div
          ref={liveRegionRef}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />

        {/* Main */}
        <main
          className="flex flex-1 items-center justify-center px-6 pb-12 pt-4 md:px-12"
          role="main"
          aria-labelledby="preferences-heading"
        >
          <div className="w-full max-w-4xl rounded-[28px] bg-white p-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] md:rounded-[32px] md:p-14">
          <h1
            id="preferences-heading"
            ref={mainHeadingRef}
            tabIndex={-1}
            className="mb-8 text-xl font-bold text-slate-900 md:text-2xl focus:outline-none"
          >
            Accommodation Preferences
          </h1>

          <form onSubmit={(e) => { e.preventDefault(); setStep("accommodations"); }}>
            <div className="space-y-8">
              {/* Accommodation Needs Section */}
              <fieldset>
                <legend className="text-lg font-bold text-slate-900 md:text-xl">
                  Accommodation Needs
                </legend>
                <p id="accommodation-needs-desc" className="mt-2 text-base text-slate-600">
                  Do you require any accommodations for the application or interview
                  process?
                </p>

                <div
                  role="radiogroup"
                  aria-labelledby="accommodation-needs-desc"
                  className="mt-6 flex flex-col space-y-4 md:flex-row md:space-x-8 md:space-y-0"
                >
                  {[
                    { id: "yes", label: "Yes" },
                    { id: "no", label: "No" },
                    { id: "discuss_later", label: "Prefer to discuss later" },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-center space-x-3"
                    >
                      <input
                        type="radio"
                        name="accommodation-need"
                        value={option.id}
                        checked={accommodationNeed === option.id}
                        onChange={() => setAccommodationNeed(option.id)}
                        className="sr-only"
                      />
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                          accommodationNeed === option.id
                            ? "bg-[#C78539]"
                            : "border border-slate-300 bg-white"
                        }`}
                        aria-hidden="true"
                      >
                        {accommodationNeed === option.id && (
                          <Check size={16} className="text-white" strokeWidth={3} />
                        )}
                      </div>
                      <span className="text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="h-px bg-slate-200" role="separator" aria-hidden="true"></div>

              {/* Disclosure Preferences Section */}
              <fieldset>
                <legend className="text-lg font-bold text-slate-900 md:text-xl">
                  Disclosure Preferences
                </legend>
                <p id="disclosure-pref-desc" className="mt-2 text-base text-slate-600">
                  When would you prefer to discuss your specific accommodation
                  needs?
                </p>

                <div
                  role="radiogroup"
                  aria-labelledby="disclosure-pref-desc"
                  className="mt-6 space-y-4"
                >
                  {[
                    { id: "during_application", label: "During Application" },
                    { id: "during_interview", label: "During Interview" },
                    { id: "after_offer", label: "After job offer" },
                    { id: "after_start", label: "After starting work" },
                    { id: "not_applicable", label: "Not applicable" },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-center space-x-3"
                    >
                      <input
                        type="radio"
                        name="disclosure-preference"
                        value={option.id}
                        checked={disclosurePreference === option.id}
                        onChange={() => setDisclosurePreference(option.id)}
                        className="sr-only"
                      />
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                          disclosurePreference === option.id
                            ? "bg-[#C78539]"
                            : "border border-slate-300 bg-white"
                        }`}
                        aria-hidden="true"
                      >
                        {disclosurePreference === option.id && (
                          <Check size={16} className="text-white" strokeWidth={3} />
                        )}
                      </div>
                      <span className="text-slate-700 font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <nav className="mt-12 flex items-center justify-between" aria-label="Form navigation">
              <button
                type="button"
                onClick={() => setStep("categories")}
                className="rounded-xl border border-slate-300 bg-white px-8 py-3 text-lg font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                aria-label="Go back to disability categories"
              >
                Back
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#C78539] px-12 py-3 text-lg font-semibold text-white transition-colors hover:bg-[#b07430] focus:outline-none focus:ring-2 focus:ring-[#C78539] focus:ring-offset-2"
                aria-label="Continue to workplace accommodations"
              >
                Next
              </button>
            </nav>
          </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F5FA] text-slate-900">
      {/* Navbar */}
      <Navbar />

      {/* Screen reader announcements */}
      <div
        ref={liveRegionRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Main */}
      <main
        className="flex flex-1 items-center justify-center px-6 pb-12 pt-4 md:px-12"
        role="main"
        aria-labelledby="accommodations-heading"
      >
        <div className="w-full max-w-6xl rounded-[28px] bg-white p-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] md:rounded-[32px] md:p-14">
        <h1
          id="accommodations-heading"
          ref={mainHeadingRef}
          tabIndex={-1}
          className="mb-2 text-xl font-bold text-slate-900 md:text-2xl focus:outline-none"
        >
          Which of the following workplace accommodations would help you perform
          at your best?
        </h1>

        <p id="accommodations-description" className="mb-8 text-base text-slate-600">
          Select all that apply. You can select multiple options or indicate if none are needed.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); handleCompleteProfile(); }}>
          <fieldset>
            <legend className="sr-only">Workplace accommodations (select all that apply)</legend>
            <div
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
              role="group"
              aria-describedby="accommodations-description"
            >
              {accommodationOptions.map((option) => {
                const isSelected = selectedAccommodations.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleAccommodation(option.id)}
                    aria-pressed={isSelected}
                    aria-label={option.label}
                    className={`relative flex items-center justify-between rounded-xl p-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-[#C78539] focus:ring-offset-2 ${
                      isSelected
                        ? "bg-[#E6F4EA] ring-1 ring-[#34A853]"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <span className="font-semibold text-slate-700">
                      {option.label}
                    </span>
                    <div
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                        isSelected ? "bg-[#34A853] text-white" : "bg-slate-300"
                      }`}
                      aria-hidden="true"
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {isParsingResume ? (
            <div
              role="status"
              aria-live="polite"
              className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900"
            >
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div>
                  <p className="font-semibold">
                    Parsing your resume...
                  </p>
                  <p className="mt-0.5 text-blue-700">
                    This may take up to 30 seconds. Please wait.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {parseFailure && !isParsingResume ? (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900"
            >
              <p className="font-semibold text-amber-800">
                {parseFailureReason === "timeout"
                  ? "Resume parsing timed out"
                  : parseFailureReason === "no_data"
                  ? "Could not extract data from resume"
                  : "Resume parsing failed"}
              </p>
              <p className="mt-1 text-amber-700">{parseFailure}</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
                {parseFailureReason === "timeout" ? (
                  <button
                    type="button"
                    onClick={handleRetryParsing}
                    disabled={isCompleting}
                    className="flex-1 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
                  >
                    Retry Parsing
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleContinueWithoutParsing}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                    parseFailureReason === "timeout"
                      ? "border border-amber-300 bg-white text-amber-700 hover:bg-amber-50"
                      : "bg-amber-600 text-white hover:bg-amber-700"
                  }`}
                >
                  Continue to Manual Entry
                </button>
              </div>
            </div>
          ) : null}

          <nav className="mt-12 flex items-center justify-between" aria-label="Form navigation">
            <button
              type="button"
              onClick={() => setStep("preferences")}
              disabled={isCompleting}
              className="rounded-xl border border-slate-300 bg-white px-8 py-3 text-lg font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              aria-label="Go back to accommodation preferences"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isCompleting}
              className="rounded-xl bg-[#C78539] px-12 py-3 text-lg font-semibold text-white transition-colors hover:bg-[#b07430] focus:outline-none focus:ring-2 focus:ring-[#C78539] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              aria-label="Complete accessibility profile and continue to resume details"
            >
              {isCompleting ? "Processing..." : "Create Profile"}
            </button>
          </nav>
        </form>
        </div>
      </main>
    </div>
  );
}
