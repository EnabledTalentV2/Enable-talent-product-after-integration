"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import DashBoardNavbar from "@/components/DashBoardNavbar";
import DashboardSubnav from "@/components/DashboardSubnav";
import BackendValidationBanner from "@/components/BackendValidationBanner";
import { useUserDataStore } from "@/lib/userDataStore";
import {
  ensureCandidateProfileSlug,
  fetchCandidateProfileDetail,
} from "@/lib/candidateProfile";
import { useCandidateProfileStore } from "@/lib/candidateProfileStore";
import { mapCandidateProfileToUserData } from "@/lib/candidateProfileUtils";
import { transformBackendResumeData } from "@/lib/transformers/resumeData.transformer";
import {
  validateBackendData,
  logValidationToConsole,
  type ValidationResult,
} from "@/lib/backendDataValidator";
import { initialUserData as defaultUserData } from "@/lib/userDataDefaults";
import type { UserData } from "@/lib/types/user";

/**
 * Transform flat backend data to nested frontend UserData structure
 * This ensures the frontend doesn't crash even if backend returns incomplete data
 */
function transformBackendToFrontend(
  backendData: Record<string, unknown>
): UserData {
  return {
    basicInfo: {
      firstName:
        (backendData.first_name as string) ||
        (backendData.firstName as string) ||
        defaultUserData.basicInfo.firstName,
      lastName:
        (backendData.last_name as string) ||
        (backendData.lastName as string) ||
        defaultUserData.basicInfo.lastName,
      email: (backendData.email as string) || defaultUserData.basicInfo.email,
      phone:
        (backendData.phone as string) ||
        (backendData.phone_number as string) ||
        defaultUserData.basicInfo.phone,
      location:
        (backendData.location as string) || defaultUserData.basicInfo.location,
      citizenshipStatus:
        (backendData.citizenship_status as string) ||
        (backendData.citizenshipStatus as string) ||
        defaultUserData.basicInfo.citizenshipStatus,
      gender:
        (backendData.gender as string) || defaultUserData.basicInfo.gender,
      ethnicity:
        (backendData.ethnicity as string) ||
        defaultUserData.basicInfo.ethnicity,
      socialProfile:
        (backendData.social_profile as string) ||
        (backendData.socialProfile as string) ||
        defaultUserData.basicInfo.socialProfile,
      linkedinUrl:
        (backendData.linkedin_url as string) ||
        (backendData.linkedinUrl as string) ||
        (backendData.linkedin as string) ||
        defaultUserData.basicInfo.linkedinUrl,
      githubUrl:
        (backendData.github_url as string) ||
        (backendData.githubUrl as string) ||
        (backendData.github as string) ||
        defaultUserData.basicInfo.githubUrl,
      portfolioUrl:
        (backendData.portfolio_url as string) ||
        (backendData.portfolioUrl as string) ||
        (backendData.portfolio as string) ||
        defaultUserData.basicInfo.portfolioUrl,
      currentStatus:
        (backendData.current_status as string) ||
        (backendData.currentStatus as string) ||
        defaultUserData.basicInfo.currentStatus,
      profilePhoto:
        (backendData.profile_photo as string) ||
        (backendData.profilePhoto as string) ||
        (backendData.avatar as string) ||
        ((backendData.profile as Record<string, unknown>)?.avatar as string) ||
        defaultUserData.basicInfo.profilePhoto,
    },
    workExperience:
      (backendData.work_experience as UserData["workExperience"]) ||
        (backendData.workExperience as UserData["workExperience"]) || {
          ...defaultUserData.workExperience,
        },
    education: (backendData.education as UserData["education"]) || {
      ...defaultUserData.education,
    },
    skills: (backendData.skills as UserData["skills"]) || {
      ...defaultUserData.skills,
    },
    projects: (backendData.projects as UserData["projects"]) || {
      ...defaultUserData.projects,
    },
    achievements: (backendData.achievements as UserData["achievements"]) || {
      ...defaultUserData.achievements,
    },
    certification: (backendData.certification as UserData["certification"]) ||
      (backendData.certifications as UserData["certification"]) || {
        ...defaultUserData.certification,
      },
    preference: (backendData.preference as UserData["preference"]) ||
      (backendData.preferences as UserData["preference"]) || {
        ...defaultUserData.preference,
      },
    otherDetails: (backendData.other_details as UserData["otherDetails"]) ||
      (backendData.otherDetails as UserData["otherDetails"]) || {
        ...defaultUserData.otherDetails,
      },
    reviewAgree: (backendData.review_agree as UserData["reviewAgree"]) ||
      (backendData.reviewAgree as UserData["reviewAgree"]) || {
        ...defaultUserData.reviewAgree,
      },
  };
}

export default function DashboardLayoutPage({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const setUserData = useUserDataStore((s) => s.setUserData);
  const patchUserData = useUserDataStore((s) => s.patchUserData);
  const setCandidateProfile = useCandidateProfileStore((s) => s.setProfile);
  const setCandidateSlug = useCandidateProfileStore((s) => s.setSlug);
  const setCandidateLoading = useCandidateProfileStore((s) => s.setLoading);
  const setCandidateError = useCandidateProfileStore((s) => s.setError);
  const resetCandidateProfile = useCandidateProfileStore((s) => s.reset);
  const [loading, setLoading] = useState(true);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      try {
        const response = await fetch("/api/user/me", {
          credentials: "include",
        });

        if (response.status === 401) {
          router.replace("/login-talent");
          return;
        }

        if (!response.ok) {
          router.replace("/login-talent");
          return;
        }

        const rawData = await response.json();

        const refreshCandidateProfile = async (userData: unknown) => {
          const candidateFlag =
            typeof userData === "object" &&
            userData !== null &&
            "is_candidate" in userData
              ? Boolean((userData as { is_candidate?: boolean }).is_candidate)
              : null;

          if (candidateFlag === false) {
            if (active) {
              resetCandidateProfile();
            }
            return;
          }

          if (active) {
            setCandidateLoading(true);
            setCandidateError(null);
          }

          try {
            const slug = await ensureCandidateProfileSlug({
              logLabel: "Dashboard",
            });

            if (!active) return;

            if (!slug) {
              setCandidateError("Unable to load candidate profile.");
              return;
            }

            setCandidateSlug(slug);

            const profile = await fetchCandidateProfileDetail(
              slug,
              "Dashboard"
            );

            if (!active) return;

            if (profile) {
              setCandidateProfile(profile);

              // Extract basic profile data (employment preferences, etc.)
              const profileData = mapCandidateProfileToUserData(profile);

              // Transform resume_data if present
              const resumeDataPayload =
                typeof profile === "object" &&
                profile !== null &&
                "resume_data" in profile
                  ? profile.resume_data
                  : null;
              const resumeData = transformBackendResumeData(resumeDataPayload);

              // Merge both transformations (resume_data takes priority for overlapping fields)
              const merged = { ...profileData, ...resumeData };

              if (Object.keys(merged).length > 0) {
                patchUserData(merged);
              }
            } else {
              setCandidateError("Unable to load candidate profile.");
            }
          } finally {
            if (active) {
              setCandidateLoading(false);
            }
          }
        };

        if (active) {
          // Validate backend data and log in development
          if (process.env.NODE_ENV === "development") {
            const validation = validateBackendData(rawData);
            setValidationResult(validation);
            logValidationToConsole(validation);
          }

          // Transform backend data to frontend structure with defaults
          const transformedData = transformBackendToFrontend(rawData);
          setUserData(() => transformedData);
          setLoading(false);
        }

        void refreshCandidateProfile(rawData);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/login-talent");
      }
    };

    checkAuth();

    return () => {
      active = false;
    };
  }, [router, setUserData, patchUserData]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F0F4F8]">
        <div className="text-slate-500">Verifying session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <DashBoardNavbar />
      <DashboardSubnav />
      <main className="px-6 pb-10 md:px-12">{children}</main>
      {/* Developer mode banner for backend data validation */}
      <BackendValidationBanner validationResult={validationResult} />
    </div>
  );
}
