"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserDataStore } from "@/lib/userDataStore";
import { apiRequest, isApiError } from "@/lib/api-client";
import {
  computeProfileCompletion,
  computeProfileSectionCompletion,
} from "@/lib/profileCompletion";
import type { StepKey } from "@/lib/types/user";
import { initialUserData } from "@/lib/userDataDefaults";
import { ensureCandidateProfileSlug } from "@/lib/candidateProfile";
import { useCandidateProfileStore } from "@/lib/candidateProfileStore";
import {
  buildCandidateProfileUpdatePayload,
  buildVerifyProfilePayload,
} from "@/lib/candidateProfileUtils";
import BasicInfo from "@/components/signup/forms/BasicInfo";
import Education from "@/components/signup/forms/Education";
import WorkExperience from "@/components/signup/forms/WorkExperience";
import Skills from "@/components/signup/forms/Skills";
import Projects from "@/components/signup/forms/Projects";
import Achievements from "@/components/signup/forms/Achievements";
import Certification from "@/components/signup/forms/Certification";
import Preference from "@/components/signup/forms/Preference";
import OtherDetails from "@/components/signup/forms/OtherDetails";
import AccessibilityNeeds from "@/components/signup/forms/AccessibilityNeeds";
import ReviewAndAgree from "@/components/signup/forms/ReviewAndAgree";

const sectionOrder: StepKey[] = [
  "basicInfo",
  "education",
  "workExperience",
  "skills",
  "projects",
  "achievements",
  "certification",
  "preference",
  "otherDetails",
  "accessibilityNeeds",
  "reviewAgree",
];

const sectionLabels: Record<StepKey, string> = {
  basicInfo: "Basic Info",
  education: "Education",
  workExperience: "Work Experience",
  skills: "Skills",
  projects: "Projects",
  achievements: "Achievements",
  certification: "Certification",
  preference: "Preferences",
  otherDetails: "Other Details",
  accessibilityNeeds: "Accessibility Needs",
  reviewAgree: "Review & Consent",
};

const fallbackAccessibilityNeeds =
  initialUserData.accessibilityNeeds ?? {
    categories: [],
    accommodationNeed: "",
    disclosurePreference: "",
    accommodations: [],
  };

const cardClass = "rounded-2xl bg-white p-6 shadow-sm";
const titleClass = "text-lg font-semibold text-slate-900";

export default function ProfileUpdatePage() {
  const router = useRouter();
  const rawUserData = useUserDataStore((s) => s.userData);
  const userData = useMemo(
    () => ({
      ...initialUserData,
      ...rawUserData,
      basicInfo: { ...initialUserData.basicInfo, ...rawUserData?.basicInfo },
      workExperience: {
        ...initialUserData.workExperience,
        ...rawUserData?.workExperience,
      },
      education: { ...initialUserData.education, ...rawUserData?.education },
      skills: { ...initialUserData.skills, ...rawUserData?.skills },
      projects: { ...initialUserData.projects, ...rawUserData?.projects },
      achievements: {
        ...initialUserData.achievements,
        ...rawUserData?.achievements,
      },
      certification: {
        ...initialUserData.certification,
        ...rawUserData?.certification,
      },
      preference: { ...initialUserData.preference, ...rawUserData?.preference },
      otherDetails: {
        ...initialUserData.otherDetails,
        ...rawUserData?.otherDetails,
      },
      accessibilityNeeds: {
        ...fallbackAccessibilityNeeds,
        ...rawUserData?.accessibilityNeeds,
      },
      reviewAgree: {
        ...initialUserData.reviewAgree,
        ...rawUserData?.reviewAgree,
      },
    }),
    [rawUserData]
  );
  const setUserData = useUserDataStore((s) => s.setUserData);
  const resetUserData = useUserDataStore((s) => s.resetUserData);
  const candidateSlug = useCandidateProfileStore((s) => s.slug);
  const setCandidateSlug = useCandidateProfileStore((s) => s.setSlug);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const completion = useMemo(
    () => computeProfileCompletion(userData),
    [userData]
  );
  const sectionCompletion = useMemo(
    () => computeProfileSectionCompletion(userData),
    [userData]
  );
  const incompleteSections = useMemo(
    () => sectionOrder.filter((key) => !sectionCompletion[key].isComplete),
    [sectionCompletion]
  );
  const hasIncompleteSections = incompleteSections.length > 0;

  useEffect(() => {
    let active = true;

    const ensureSlug = async () => {
      if (candidateSlug) {
        if (active) {
          setError(null);
          setLoading(false);
        }
        return;
      }

      try {
        const slug = await ensureCandidateProfileSlug({
          logLabel: "Profile Update",
        });
        if (!active) return;
        if (!slug) {
          setError("Unable to load candidate profile.");
          return;
        }
        setCandidateSlug(slug);
        setError(null);
      } catch {
        if (active) {
          setError("Unable to load candidate profile.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    ensureSlug();

    return () => {
      active = false;
    };
  }, [candidateSlug, setCandidateSlug]);

  const handleSave = async (redirect: boolean) => {
    if (saving) return;
    if (!candidateSlug) {
      setSaveError("Unable to save profile. Missing candidate information.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const verifyPayload = buildVerifyProfilePayload(userData);
      if (Object.keys(verifyPayload).length > 0) {
        await apiRequest<unknown>(
          `/api/candidates/profiles/${candidateSlug}/verify-profile/`,
          {
            method: "POST",
            body: JSON.stringify(verifyPayload),
          }
        );
      }

      const candidatePayload = buildCandidateProfileUpdatePayload(userData);
      if (Object.keys(candidatePayload).length > 0) {
        await apiRequest<unknown>(
          `/api/candidates/profiles/${candidateSlug}/`,
          {
            method: "PATCH",
            body: JSON.stringify(candidatePayload),
          }
        );
      }

      setSaveSuccess("Profile saved.");
      if (redirect) {
        router.push("/dashboard");
      }
    } catch (err) {
      if (isApiError(err) && err.status === 401) {
        resetUserData();
        router.replace("/login-talent?next=/dashboard/profile-update");
        return;
      }
      setSaveError("Unable to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderSection = (key: StepKey) => {
    switch (key) {
      case "basicInfo":
        return (
          <BasicInfo
            data={userData.basicInfo}
            onChange={(patch) =>
              setUserData((prev) => ({
                ...prev,
                basicInfo: { ...prev.basicInfo, ...patch },
              }))
            }
          />
        );
      case "education":
        return (
          <Education
            data={userData.education}
            onChange={(patch) =>
              setUserData((prev) => ({
                ...prev,
                education: { ...prev.education, ...patch },
              }))
            }
          />
        );
      case "workExperience":
        return (
          <WorkExperience
            data={userData.workExperience}
            onExperienceTypeChange={(experienceType) =>
              setUserData((prev) => ({
                ...prev,
                workExperience: { ...prev.workExperience, experienceType },
              }))
            }
            onEntryChange={(index, patch) =>
              setUserData((prev) => {
                const nextEntries = prev.workExperience.entries.map(
                  (entry, idx) =>
                    idx === index ? { ...entry, ...patch } : entry
                );
                return {
                  ...prev,
                  workExperience: {
                    ...prev.workExperience,
                    entries: nextEntries,
                  },
                };
              })
            }
            onAddEntry={() =>
              setUserData((prev) => ({
                ...prev,
                workExperience: {
                  ...prev.workExperience,
                  entries: [
                    ...prev.workExperience.entries,
                    {
                      company: "",
                      role: "",
                      from: "",
                      to: "",
                      description: "",
                    },
                  ],
                },
              }))
            }
            onRemoveEntry={(index) =>
              setUserData((prev) => {
                const nextEntries = prev.workExperience.entries.filter(
                  (_, idx) => idx !== index
                );
                return {
                  ...prev,
                  workExperience: {
                    ...prev.workExperience,
                    entries: nextEntries,
                  },
                };
              })
            }
          />
        );
      case "skills":
        return (
          <Skills
            data={userData.skills}
            onChange={(patch) =>
              setUserData((prev) => ({
                ...prev,
                skills: { ...prev.skills, ...patch },
              }))
            }
          />
        );
      case "projects":
        return (
          <Projects
            data={userData.projects}
            onNoProjectsChange={(value) =>
              setUserData((prev) => ({
                ...prev,
                projects: { ...prev.projects, noProjects: value },
              }))
            }
            onEntryChange={(index, patch) =>
              setUserData((prev) => {
                const nextEntries = prev.projects.entries.map((entry, idx) =>
                  idx === index ? { ...entry, ...patch } : entry
                );
                return {
                  ...prev,
                  projects: { ...prev.projects, entries: nextEntries },
                };
              })
            }
            onAddEntry={() =>
              setUserData((prev) => ({
                ...prev,
                projects: {
                  ...prev.projects,
                  entries: [
                    ...prev.projects.entries,
                    {
                      projectName: "",
                      projectDescription: "",
                      current: false,
                      from: "",
                      to: "",
                    },
                  ],
                },
              }))
            }
            onRemoveEntry={(index) =>
              setUserData((prev) => {
                const nextEntries = prev.projects.entries.filter(
                  (_, idx) => idx !== index
                );
                return {
                  ...prev,
                  projects: { ...prev.projects, entries: nextEntries },
                };
              })
            }
          />
        );
      case "achievements":
        return (
          <Achievements
            data={userData.achievements}
            onEntryChange={(index, patch) =>
              setUserData((prev) => {
                const nextEntries = prev.achievements.entries.map(
                  (entry, idx) =>
                    idx === index ? { ...entry, ...patch } : entry
                );
                return {
                  ...prev,
                  achievements: { ...prev.achievements, entries: nextEntries },
                };
              })
            }
            onAddEntry={() =>
              setUserData((prev) => ({
                ...prev,
                achievements: {
                  ...prev.achievements,
                  entries: [
                    ...prev.achievements.entries,
                    { title: "", issueDate: "", description: "" },
                  ],
                },
              }))
            }
            onRemoveEntry={(index) =>
              setUserData((prev) => {
                const nextEntries = prev.achievements.entries.filter(
                  (_, idx) => idx !== index
                );
                return {
                  ...prev,
                  achievements: { ...prev.achievements, entries: nextEntries },
                };
              })
            }
          />
        );
      case "certification":
        return (
          <Certification
            data={userData.certification}
            onToggleNoCertification={(value) =>
              setUserData((prev) => {
                const nextEntries = prev.certification.entries.length
                  ? prev.certification.entries
                  : [
                      {
                        name: "",
                        issueDate: "",
                        organization: "",
                        credentialIdUrl: "",
                      },
                    ];
                return {
                  ...prev,
                  certification: {
                    ...prev.certification,
                    noCertification: value,
                    entries: nextEntries,
                  },
                };
              })
            }
            onEntryChange={(index, patch) =>
              setUserData((prev) => {
                const nextEntries = prev.certification.entries.map(
                  (entry, idx) =>
                    idx === index ? { ...entry, ...patch } : entry
                );
                return {
                  ...prev,
                  certification: {
                    ...prev.certification,
                    entries: nextEntries,
                  },
                };
              })
            }
            onAddEntry={() =>
              setUserData((prev) => ({
                ...prev,
                certification: {
                  ...prev.certification,
                  entries: [
                    ...prev.certification.entries,
                    {
                      name: "",
                      issueDate: "",
                      organization: "",
                      credentialIdUrl: "",
                    },
                  ],
                },
              }))
            }
            onRemoveEntry={(index) =>
              setUserData((prev) => {
                const nextEntries = prev.certification.entries.filter(
                  (_, idx) => idx !== index
                );
                return {
                  ...prev,
                  certification: {
                    ...prev.certification,
                    entries: nextEntries,
                  },
                };
              })
            }
          />
        );
      case "preference":
        return (
          <Preference
            data={userData.preference}
            onChange={(patch) =>
              setUserData((prev) => ({
                ...prev,
                preference: { ...prev.preference, ...patch },
              }))
            }
          />
        );
      case "otherDetails":
        return (
          <OtherDetails
            data={userData.otherDetails}
            onChange={(patch) =>
              setUserData((prev) => ({
                ...prev,
                otherDetails: { ...prev.otherDetails, ...patch },
              }))
            }
            onLanguageChange={(index, patch) =>
              setUserData((prev) => {
                const nextLanguages = prev.otherDetails.languages.map(
                  (entry, idx) =>
                    idx === index ? { ...entry, ...patch } : entry
                );
                return {
                  ...prev,
                  otherDetails: {
                    ...prev.otherDetails,
                    languages: nextLanguages,
                  },
                };
              })
            }
            onAddLanguage={() =>
              setUserData((prev) => ({
                ...prev,
                otherDetails: {
                  ...prev.otherDetails,
                  languages: [
                    ...prev.otherDetails.languages,
                    { language: "", speaking: "", reading: "", writing: "" },
                  ],
                },
              }))
            }
            onRemoveLanguage={(index) =>
              setUserData((prev) => {
                const nextLanguages = prev.otherDetails.languages.filter(
                  (_, idx) => idx !== index
                );
                return {
                  ...prev,
                  otherDetails: {
                    ...prev.otherDetails,
                    languages: nextLanguages,
                  },
                };
              })
            }
          />
        );
      case "accessibilityNeeds":
        return (
          <AccessibilityNeeds
            data={userData.accessibilityNeeds ?? fallbackAccessibilityNeeds}
            onChange={(patch) =>
              setUserData((prev) => ({
                ...prev,
                accessibilityNeeds: {
                  ...(prev.accessibilityNeeds ?? fallbackAccessibilityNeeds),
                  ...patch,
                },
              }))
            }
          />
        );
      case "reviewAgree":
        return (
          <ReviewAndAgree
            data={userData.reviewAgree}
            onChange={(patch) =>
              setUserData((prev) => ({
                ...prev,
                reviewAgree: { ...prev.reviewAgree, ...patch },
              }))
            }
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-base text-slate-600">
        Loading your profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-base font-medium text-red-600">{error}</div>
    );
  }

  return (
    <section className="space-y-6 max-w-360 mx-auto py-10">
      <header className="space-y-2">
        <p className="text-base font-semibold text-amber-700">Profile Update</p>
        <h1 className="text-2xl font-bold text-slate-900">
          Finish your profile
        </h1>
        <p className="text-base text-slate-600">
          Review and update your profile details below. Profile completion:{" "}
          {completion.percent}%.
        </p>
      </header>

      {!hasIncompleteSections ? (
        <div className={cardClass}>
          <h2 className={titleClass}>All set</h2>
          <p className="mt-2 text-base text-slate-600">
            Your profile is complete.
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mt-4 inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-base font-semibold text-white transition hover:bg-slate-800"
          >
            Back to dashboard
          </button>
        </div>
      ) : null}

      <div className="space-y-6">
        {sectionOrder.map((key) => (
          <section key={key} className={cardClass}>
            <h2 className={titleClass}>{sectionLabels[key]}</h2>
            <div className="mt-4">{renderSection(key)}</div>
          </section>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={saving}
          className="rounded-lg bg-[#C27528] px-5 py-2.5 text-base font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={saving}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-base font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Save &amp; return
        </button>
        {saveError ? (
          <span className="text-base font-medium text-red-600">
            {saveError}
          </span>
        ) : null}
        {saveSuccess ? (
          <span className="text-base font-medium text-emerald-600">
            {saveSuccess}
          </span>
        ) : null}
      </div>
    </section>
  );
}
