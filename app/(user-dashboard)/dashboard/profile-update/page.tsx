"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useUserDataStore } from "@/lib/userDataStore";
import { apiRequest, isApiError } from "@/lib/api-client";
import {
  computeProfileSectionCompletion,
} from "@/lib/profileCompletion";
import type { StepKey, UserData } from "@/lib/types/user";
import { initialUserData } from "@/lib/userDataDefaults";
import {
  ensureCandidateProfileSlug,
  fetchCandidateProfileFull,
} from "@/lib/candidateProfile";
import { useCandidateProfileStore } from "@/lib/candidateProfileStore";
import {
  buildCandidateAchievementPayloads,
  buildCandidateCertificationPayloads,
  buildCandidateEducationPayloads,
  buildCandidateLanguagePayloads,
  buildCandidateProjectPayloads,
  buildCandidateProfileCorePayload,
  buildCandidateSkillPayloads,
  buildCandidateWorkExperiencePayloads,
  normalizeGenderForBackend,
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

const allowedResumeExtensions = [".pdf"];
const allowedResumeMimeTypes = new Set(["application/pdf"]);
const MAX_RESUME_FILE_SIZE = 10 * 1024 * 1024;
const skipUserProfilePatch = false;

const isAllowedResumeFile = (file: File) => {
  if (file.type && allowedResumeMimeTypes.has(file.type)) return true;
  const name = file.name.toLowerCase();
  return allowedResumeExtensions.some((ext) => name.endsWith(ext));
};

type WorkEntry = UserData["workExperience"]["entries"][number];
type ProjectEntry = UserData["projects"]["entries"][number];
type CertificationEntry = UserData["certification"]["entries"][number];
type LanguageEntry = UserData["otherDetails"]["languages"][number];

type RequiredValidationResult = {
  basicInfoErrors: Partial<Record<keyof UserData["basicInfo"], string>>;
  educationErrors: Partial<Record<keyof UserData["education"], string>>;
  workExpErrors: {
    experienceType?: string;
    entries?: Record<number, Partial<Record<keyof WorkEntry, string>>>;
  };
  skillErrors: Partial<Record<keyof UserData["skills"], string>>;
  projectErrors: {
    entries?: Record<number, Partial<Record<keyof ProjectEntry, string>>>;
  };
  certErrors: {
    entries?: Record<number, Partial<Record<keyof CertificationEntry, string>>>;
  };
  preferenceErrors: {
    hasWorkVisa?: string;
  };
  otherDetailsErrors: {
    languages?: Record<number, Partial<Record<keyof LanguageEntry, string>>>;
    careerStage?: string;
    availability?: string;
    desiredSalary?: string;
  };
  firstErrorId: string | null;
  hasErrors: boolean;
};

const isBlank = (value: string | undefined) =>
  !value || value.trim().length === 0;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeSkillKey = (value: string) => value.trim().toLowerCase();
const normalizeProjectKey = (value: string) => value.trim().toLowerCase();
const normalizeAchievementKey = (title: string, issueDate?: string) => {
  const titleKey = title.trim().toLowerCase();
  const dateKey = (issueDate ?? "").trim();
  return dateKey ? `${titleKey}::${dateKey}` : titleKey;
};
const normalizeCertificationKey = (name: string, organization?: string) => {
  const nameKey = name.trim().toLowerCase();
  const orgKey = (organization ?? "").trim().toLowerCase();
  return orgKey ? `${nameKey}::${orgKey}` : nameKey;
};

const validateRequiredFields = (data: UserData): RequiredValidationResult => {
  const basicInfoErrors: RequiredValidationResult["basicInfoErrors"] = {};
  const educationErrors: RequiredValidationResult["educationErrors"] = {};
  const workExpErrors: RequiredValidationResult["workExpErrors"] = {};
  const skillErrors: RequiredValidationResult["skillErrors"] = {};
  const projectErrors: RequiredValidationResult["projectErrors"] = {};
  const certErrors: RequiredValidationResult["certErrors"] = {};
  const preferenceErrors: RequiredValidationResult["preferenceErrors"] = {};
  const otherDetailsErrors: RequiredValidationResult["otherDetailsErrors"] = {};

  let firstErrorId: string | null = null;
  let hasErrors = false;

  const requiredBasicFields: Array<{
    field: keyof UserData["basicInfo"];
    message: string;
  }> = [
    { field: "firstName", message: "Please enter First Name" },
    { field: "lastName", message: "Please enter Last Name" },
    { field: "email", message: "Please enter Email Address" },
    { field: "phone", message: "Please enter Phone number" },
    { field: "location", message: "Please enter Location" },
    {
      field: "citizenshipStatus",
      message: "Please select Citizenship status",
    },
    { field: "gender", message: "Please select Gender" },
    { field: "ethnicity", message: "Please select Ethnicity" },
    {
      field: "currentStatus",
      message: "Please enter your current status and goal",
    },
  ];

  requiredBasicFields.forEach(({ field, message }) => {
    if (isBlank(data.basicInfo[field])) {
      basicInfoErrors[field] = message;
      hasErrors = true;
      if (!firstErrorId) firstErrorId = `basicInfo-${field}`;
    }
  });

  const requiredEducationFields: Array<{
    field: keyof UserData["education"];
    message: string;
  }> = [
    { field: "courseName", message: "Please enter the Course Name" },
    { field: "major", message: "Please enter Major" },
    { field: "institution", message: "Please enter Institution" },
  ];

  requiredEducationFields.forEach(({ field, message }) => {
    if (isBlank(data.education[field])) {
      educationErrors[field] = message;
      hasErrors = true;
      if (!firstErrorId) firstErrorId = `education-${field}`;
    }
  });

  if (data.workExperience.experienceType !== "fresher") {
    const requiredWorkFields: Array<{
      field: keyof WorkEntry;
      message: string;
    }> = [
      { field: "company", message: "Please enter Company Name" },
      { field: "role", message: "Please enter Role" },
      { field: "from", message: "Please enter start date" },
    ];

    const workEntries = data.workExperience.entries;
    if (workEntries.length === 0) {
      workExpErrors.entries = {
        0: {
          company: "Please enter Company Name",
          role: "Please enter Role",
          from: "Please enter start date",
        },
      };
      hasErrors = true;
      if (!firstErrorId) firstErrorId = "workExp-0-company";
    }

    workEntries.forEach((entry, idx) => {
      requiredWorkFields.forEach(({ field, message }) => {
        if (isBlank(entry[field] as string)) {
          if (!workExpErrors.entries) workExpErrors.entries = {};
          if (!workExpErrors.entries[idx]) workExpErrors.entries[idx] = {};
          workExpErrors.entries[idx]![field] = message;
          hasErrors = true;
          if (!firstErrorId) firstErrorId = `workExp-${idx}-${field}`;
        }
      });
    });
  }

  if (!data.skills.primaryList || data.skills.primaryList.length === 0) {
    skillErrors.skills = "Please add at least one skill";
    hasErrors = true;
    if (!firstErrorId) firstErrorId = "skills-input";
  }

  if (!data.projects.noProjects) {
    const requiredProjectFields: Array<{
      field: keyof ProjectEntry;
      message: string;
    }> = [
      { field: "projectName", message: "Please enter Project name" },
    ];

    const projectEntries = data.projects.entries;
    if (projectEntries.length === 0) {
      projectErrors.entries = {
        0: {
          projectName: "Please enter Project name",
        },
      };
      hasErrors = true;
      if (!firstErrorId) firstErrorId = "project-0-projectName";
    }

    projectEntries.forEach((entry, idx) => {
      requiredProjectFields.forEach(({ field, message }) => {
        if (field === "to" && entry.current) return;
        if (isBlank(entry[field] as string)) {
          if (!projectErrors.entries) projectErrors.entries = {};
          if (!projectErrors.entries[idx]) projectErrors.entries[idx] = {};
          projectErrors.entries[idx]![field] = message;
          hasErrors = true;
          if (!firstErrorId) firstErrorId = `project-${idx}-${field}`;
        }
      });
    });
  }

  if (!data.certification.noCertification) {
    const requiredCertFields: Array<{
      field: keyof CertificationEntry;
      message: string;
    }> = [
      { field: "name", message: "Please enter Name of certification" },
    ];

    const certEntries = data.certification.entries;
    if (certEntries.length === 0) {
      certErrors.entries = {
        0: {
          name: "Please enter Name of certification",
        },
      };
      hasErrors = true;
      if (!firstErrorId) firstErrorId = "cert-0-name";
    }

    certEntries.forEach((entry, idx) => {
      requiredCertFields.forEach(({ field, message }) => {
        if (isBlank(entry[field] as string)) {
          if (!certErrors.entries) certErrors.entries = {};
          if (!certErrors.entries[idx]) certErrors.entries[idx] = {};
          certErrors.entries[idx]![field] = message;
          hasErrors = true;
          if (!firstErrorId) firstErrorId = `cert-${idx}-${field}`;
        }
      });
    });
  }

  const requiredLanguageFields: Array<{
    field: keyof LanguageEntry;
    message: string;
  }> = [
    { field: "language", message: "Please select Language" },
    { field: "speaking", message: "Please select Speaking level" },
    { field: "reading", message: "Please select Reading level" },
    { field: "writing", message: "Please select Writing level" },
  ];
  const requiredOtherFields: Array<{
    field: keyof Pick<
      UserData["otherDetails"],
      "availability" | "desiredSalary"
    >;
    message: string;
    id: string;
  }> = [
    {
      field: "availability",
      message:
        "Please enter your earliest availability for full-time opportunities",
      id: "otherDetails-availability",
    },
    {
      field: "desiredSalary",
      message: "Please select desired salary",
      id: "otherDetails-desiredSalary",
    },
  ];

  const langEntries = data.otherDetails.languages;
  if (langEntries.length === 0) {
    otherDetailsErrors.languages = {
      0: {
        language: "Please select Language",
        speaking: "Please select Speaking level",
        reading: "Please select Reading level",
        writing: "Please select Writing level",
      },
    };
    hasErrors = true;
    if (!firstErrorId) firstErrorId = "otherDetails-lang-0-language";
  }

  langEntries.forEach((entry, idx) => {
    requiredLanguageFields.forEach(({ field, message }) => {
      if (isBlank(entry[field])) {
        if (!otherDetailsErrors.languages) otherDetailsErrors.languages = {};
        if (!otherDetailsErrors.languages[idx])
          otherDetailsErrors.languages[idx] = {};
        otherDetailsErrors.languages[idx]![field] = message;
        hasErrors = true;
        if (!firstErrorId) firstErrorId = `otherDetails-lang-${idx}-${field}`;
      }
    });
  });

  requiredOtherFields.forEach(({ field, message, id }) => {
    if (isBlank(data.otherDetails[field])) {
      otherDetailsErrors[field] = message;
      hasErrors = true;
      if (!firstErrorId) firstErrorId = id;
    }
  });

  // Validate hasWorkVisa (required)
  if (data.preference.hasWorkVisa === null) {
    preferenceErrors.hasWorkVisa = "Please select whether you have a valid work visa";
    hasErrors = true;
    if (!firstErrorId) firstErrorId = "preference-hasWorkVisa";
  }

  return {
    basicInfoErrors,
    educationErrors,
    workExpErrors,
    skillErrors,
    projectErrors,
    certErrors,
    preferenceErrors,
    otherDetailsErrors,
    firstErrorId,
    hasErrors,
  };
};

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
  const [showValidation, setShowValidation] = useState(false);
  const [firstErrorId, setFirstErrorId] = useState<string | null>(null);
  const [basicInfoErrors, setBasicInfoErrors] = useState<
    Partial<Record<keyof UserData["basicInfo"], string>>
  >({});
  const [educationErrors, setEducationErrors] = useState<
    Partial<Record<keyof UserData["education"], string>>
  >({});
  const [workExpErrors, setWorkExpErrors] = useState<{
    experienceType?: string;
    entries?: Record<number, Partial<Record<keyof WorkEntry, string>>>;
  }>({});
  const [skillErrors, setSkillErrors] = useState<
    Partial<Record<keyof UserData["skills"], string>>
  >({});
  const [projectErrors, setProjectErrors] = useState<{
    entries?: Record<number, Partial<Record<keyof ProjectEntry, string>>>;
  }>({});
  const [certErrors, setCertErrors] = useState<{
    entries?: Record<number, Partial<Record<keyof CertificationEntry, string>>>;
  }>({});
  const [preferenceErrors, setPreferenceErrors] = useState<{
    hasWorkVisa?: string;
  }>({});
  const [otherDetailsErrors, setOtherDetailsErrors] = useState<{
    languages?: Record<number, Partial<Record<keyof LanguageEntry, string>>>;
    careerStage?: string;
    availability?: string;
    desiredSalary?: string;
  }>({});
  const resumeInputRef = useRef<HTMLInputElement | null>(null);
  const [resumeUploadError, setResumeUploadError] = useState<string | null>(
    null
  );
  const [resumeUploadSuccess, setResumeUploadSuccess] = useState<string | null>(
    null
  );
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [selectedResumeName, setSelectedResumeName] = useState<string | null>(
    null
  );

  const validationMessage = "Please complete required fields before saving.";

  const sectionCompletion = useMemo(
    () => computeProfileSectionCompletion(userData),
    [userData]
  );
  const completion = useMemo(() => {
    const totalSteps = sectionOrder.length;
    const completedSteps = sectionOrder.filter(
      (key) => sectionCompletion[key]?.isComplete
    ).length;
    const percent =
      totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return {
      percent,
      isComplete: totalSteps > 0 && completedSteps === totalSteps,
    };
  }, [sectionCompletion]);
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

  useEffect(() => {
    if (!showValidation) return;
    const validation = validateRequiredFields(userData);
    setBasicInfoErrors(validation.basicInfoErrors);
    setEducationErrors(validation.educationErrors);
    setWorkExpErrors(validation.workExpErrors);
    setSkillErrors(validation.skillErrors);
    setProjectErrors(validation.projectErrors);
    setCertErrors(validation.certErrors);
    setPreferenceErrors(validation.preferenceErrors);
    setOtherDetailsErrors(validation.otherDetailsErrors);

    if (!validation.hasErrors && saveError === validationMessage) {
      setSaveError(null);
    }
  }, [showValidation, userData, saveError, validationMessage]);

  useEffect(() => {
    if (!firstErrorId) return;
    const el = document.getElementById(firstErrorId);
    if (el instanceof HTMLElement) {
      el.focus({ preventScroll: false });
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [firstErrorId]);

  const handleSave = async (redirect: boolean) => {
    if (saving) return;
    if (!candidateSlug) {
      setSaveError("Unable to save profile. Missing candidate information.");
      return;
    }
    setSaveSuccess(null);

    const validation = validateRequiredFields(userData);
    setShowValidation(true);
    setBasicInfoErrors(validation.basicInfoErrors);
    setEducationErrors(validation.educationErrors);
    setWorkExpErrors(validation.workExpErrors);
    setSkillErrors(validation.skillErrors);
    setProjectErrors(validation.projectErrors);
    setCertErrors(validation.certErrors);
    setPreferenceErrors(validation.preferenceErrors);
    setOtherDetailsErrors(validation.otherDetailsErrors);
    setFirstErrorId(validation.firstErrorId);

    if (validation.hasErrors) {
      setSaveError(validationMessage);
      return;
    }

    setSaving(true);
    setSaveError(null);

      try {
        const firstName = userData.basicInfo.firstName.trim();
        const lastName = userData.basicInfo.lastName.trim();
        const personalProfile: Record<string, unknown> = {};
        const phone = userData.basicInfo.phone.trim();
        const location = userData.basicInfo.location.trim();
        const citizenshipStatus = userData.basicInfo.citizenshipStatus.trim();
        const gender = normalizeGenderForBackend(userData.basicInfo.gender);
        const ethnicity = userData.basicInfo.ethnicity.trim();
        const linkedinUrl = userData.basicInfo.linkedinUrl.trim();
        const githubUrl = userData.basicInfo.githubUrl.trim();
        const portfolioUrl =
          userData.basicInfo.portfolioUrl.trim() ||
          userData.basicInfo.socialProfile.trim();
        const currentStatus = userData.basicInfo.currentStatus.trim();

        if (phone) personalProfile.phone = phone;
        if (location) personalProfile.location = location;
        if (citizenshipStatus)
          personalProfile.citizenship_status = citizenshipStatus;
        if (gender) personalProfile.gender = gender;
        if (ethnicity) personalProfile.ethnicity = ethnicity;
        if (linkedinUrl) personalProfile.linkedin_url = linkedinUrl;
        if (githubUrl) personalProfile.github_url = githubUrl;
        if (portfolioUrl) personalProfile.portfolio_url = portfolioUrl;
        if (currentStatus) personalProfile.current_status = currentStatus;

        const userPayload: Record<string, unknown> = {};
        if (firstName) userPayload.first_name = firstName;
        if (lastName) userPayload.last_name = lastName;
        if (Object.keys(personalProfile).length > 0) {
          userPayload.profile = personalProfile;
        }

        if (!skipUserProfilePatch && Object.keys(userPayload).length > 0) {
          await apiRequest("/api/auth/users/me/", {
            method: "PATCH",
            body: JSON.stringify(userPayload),
          });
        }

      const profilePayload = buildCandidateProfileCorePayload(userData);
      const hasPayload = Object.keys(profilePayload).length > 0;

      if (hasPayload) {
        await apiRequest<unknown>(
          `/api/candidates/profiles/${candidateSlug}/`,
          {
            method: "PATCH",
            body: JSON.stringify(profilePayload),
          }
        );
      }

      const fullProfile = await fetchCandidateProfileFull(
        candidateSlug,
        "Profile Update"
      );
      const verifiedProfile = isRecord(fullProfile?.verified_profile)
        ? fullProfile?.verified_profile
        : null;
      const profileRoot = isRecord(fullProfile) ? fullProfile : null;
      const existingEducation = Array.isArray(verifiedProfile?.education)
        ? verifiedProfile.education
        : [];
      const existingSkills = Array.isArray(verifiedProfile?.skills)
        ? verifiedProfile.skills
        : [];
      const existingLanguages = Array.isArray(verifiedProfile?.languages)
        ? verifiedProfile.languages
        : [];
      const workExperienceContainer = isRecord(verifiedProfile?.work_experience)
        ? verifiedProfile.work_experience
        : isRecord(verifiedProfile?.workExperience)
        ? verifiedProfile.workExperience
        : isRecord(verifiedProfile?.work_experiences)
        ? verifiedProfile.work_experiences
        : isRecord(profileRoot?.work_experience)
        ? profileRoot.work_experience
        : isRecord(profileRoot?.workExperience)
        ? profileRoot.workExperience
        : isRecord(profileRoot?.work_experiences)
        ? profileRoot.work_experiences
        : null;
      const existingWorkExperience = Array.isArray(
        verifiedProfile?.work_experience
      )
        ? verifiedProfile.work_experience
        : Array.isArray(profileRoot?.work_experience)
        ? profileRoot.work_experience
        : Array.isArray(verifiedProfile?.work_experiences)
        ? verifiedProfile.work_experiences
        : Array.isArray(profileRoot?.work_experiences)
        ? profileRoot.work_experiences
        : Array.isArray(verifiedProfile?.workExperience)
        ? verifiedProfile.workExperience
        : Array.isArray(profileRoot?.workExperience)
        ? profileRoot.workExperience
        : Array.isArray(
            (workExperienceContainer as Record<string, unknown>)?.entries
          )
        ? ((workExperienceContainer as Record<string, unknown>)
            ?.entries as unknown[])
        : [];
      const projectsContainer = isRecord(verifiedProfile?.projects)
        ? verifiedProfile.projects
        : isRecord(verifiedProfile?.project)
        ? verifiedProfile.project
        : isRecord(profileRoot?.projects)
        ? profileRoot.projects
        : isRecord(profileRoot?.project)
        ? profileRoot.project
        : null;
      const existingProjects = Array.isArray(verifiedProfile?.projects)
        ? verifiedProfile.projects
        : Array.isArray(profileRoot?.projects)
        ? profileRoot.projects
        : Array.isArray(verifiedProfile?.project)
        ? verifiedProfile.project
        : Array.isArray(profileRoot?.project)
        ? profileRoot.project
        : Array.isArray((projectsContainer as Record<string, unknown>)?.entries)
        ? ((projectsContainer as Record<string, unknown>)?.entries as unknown[])
        : [];
      const achievementsContainer = isRecord(verifiedProfile?.achievements)
        ? verifiedProfile.achievements
        : isRecord(verifiedProfile?.achievement)
        ? verifiedProfile.achievement
        : isRecord(verifiedProfile?.awards)
        ? verifiedProfile.awards
        : isRecord(profileRoot?.achievements)
        ? profileRoot.achievements
        : isRecord(profileRoot?.achievement)
        ? profileRoot.achievement
        : isRecord(profileRoot?.awards)
        ? profileRoot.awards
        : null;
      const existingAchievements = Array.isArray(verifiedProfile?.achievements)
        ? verifiedProfile.achievements
        : Array.isArray(profileRoot?.achievements)
        ? profileRoot.achievements
        : Array.isArray(verifiedProfile?.achievement)
        ? verifiedProfile.achievement
        : Array.isArray(profileRoot?.achievement)
        ? profileRoot.achievement
        : Array.isArray(verifiedProfile?.awards)
        ? verifiedProfile.awards
        : Array.isArray(profileRoot?.awards)
        ? profileRoot.awards
        : Array.isArray(
            (achievementsContainer as Record<string, unknown>)?.entries
          )
        ? ((achievementsContainer as Record<string, unknown>)
            ?.entries as unknown[])
        : [];
      const certificationsContainer = isRecord(verifiedProfile?.certifications)
        ? verifiedProfile.certifications
        : isRecord(verifiedProfile?.certification)
        ? verifiedProfile.certification
        : isRecord(verifiedProfile?.certificates)
        ? verifiedProfile.certificates
        : isRecord(profileRoot?.certifications)
        ? profileRoot.certifications
        : isRecord(profileRoot?.certification)
        ? profileRoot.certification
        : isRecord(profileRoot?.certificates)
        ? profileRoot.certificates
        : null;
      const existingCertifications = Array.isArray(
        verifiedProfile?.certifications
      )
        ? verifiedProfile.certifications
        : Array.isArray(profileRoot?.certifications)
        ? profileRoot.certifications
        : Array.isArray(verifiedProfile?.certification)
        ? verifiedProfile.certification
        : Array.isArray(profileRoot?.certification)
        ? profileRoot.certification
        : Array.isArray(verifiedProfile?.certificates)
        ? verifiedProfile.certificates
        : Array.isArray(profileRoot?.certificates)
        ? profileRoot.certificates
        : Array.isArray(
            (certificationsContainer as Record<string, unknown>)?.entries
          )
        ? ((certificationsContainer as Record<string, unknown>)
            ?.entries as unknown[])
        : [];

      const educationPayloads = buildCandidateEducationPayloads(
        userData,
        existingEducation
      );
      for (const payload of educationPayloads) {
        await apiRequest("/api/candidates/education/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      const skillPayloads = buildCandidateSkillPayloads(
        userData,
        existingSkills
      );
      for (const payload of skillPayloads) {
        await apiRequest("/api/candidates/skills/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      const existingSkillRecords = existingSkills
        .map((entry) => {
          if (!isRecord(entry)) {
            const name =
              typeof entry === "string" || typeof entry === "number"
                ? String(entry).trim()
                : "";
            return name ? { id: undefined, name } : null;
          }
          const name =
            typeof entry.name === "string"
              ? entry.name
              : typeof entry.skill === "string"
              ? entry.skill
              : typeof entry.title === "string"
              ? entry.title
              : typeof entry.label === "string"
              ? entry.label
              : "";
          const trimmedName = name.trim();
          if (!trimmedName) return null;
          const idValue =
            entry.id ?? entry.pk ?? entry.skill_id ?? entry.skillId;
          const id =
            typeof idValue === "number" || typeof idValue === "string"
              ? idValue
              : undefined;
          return { id, name: trimmedName };
        })
        .filter(Boolean) as Array<{ id?: number | string; name: string }>;
      const existingSkillById = new Map<
        string,
        { id?: number | string; name: string }
      >();
      const existingSkillByKey = new Map<
        string,
        { id?: number | string; name: string }
      >();
      existingSkillRecords.forEach((record) => {
        const key = normalizeSkillKey(record.name);
        if (!key) return;
        if (!existingSkillByKey.has(key)) {
          existingSkillByKey.set(key, record);
        }
        if (record.id !== undefined && record.id !== null) {
          existingSkillById.set(String(record.id), record);
        }
      });

      const currentSkillMap = new Map<
        string,
        { id?: number | string; name: string }
      >();
      (userData.skills.primaryList ?? []).forEach((skill) => {
        const name = skill.name.trim();
        if (!name) return;
        const key = normalizeSkillKey(name);
        if (currentSkillMap.has(key)) return;
        currentSkillMap.set(key, { id: skill.id, name });
      });
      const currentSkillKeys = new Set(currentSkillMap.keys());

      const skillUpdates: Array<{ id: number | string; name: string }> = [];
      currentSkillMap.forEach((skill, key) => {
        const resolvedId = skill.id ?? existingSkillByKey.get(key)?.id;
        if (
          resolvedId === undefined ||
          resolvedId === null ||
          resolvedId === ""
        ) {
          return;
        }
        const existingRecord = existingSkillById.get(String(resolvedId));
        if (
          existingRecord &&
          normalizeSkillKey(existingRecord.name) === key
        ) {
          return;
        }
        skillUpdates.push({ id: resolvedId, name: skill.name });
      });

      for (const update of skillUpdates) {
        await apiRequest(`/api/candidates/skills/${update.id}/`, {
          method: "PATCH",
          body: JSON.stringify({ name: update.name }),
        });
      }

      const skillDeletes = existingSkillRecords.filter((record) => {
        const key = normalizeSkillKey(record.name);
        if (!key) return false;
        if (record.id === undefined || record.id === null || record.id === "") {
          return false;
        }
        return !currentSkillKeys.has(key);
      });

      for (const record of skillDeletes) {
        await apiRequest(`/api/candidates/skills/${record.id}/`, {
          method: "DELETE",
        });
      }

      const languagePayloads = buildCandidateLanguagePayloads(
        userData,
        existingLanguages
      );
      for (const payload of languagePayloads) {
        await apiRequest("/api/candidates/languages/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      const workExperiencePayloads =
        buildCandidateWorkExperiencePayloads(userData);
      const existingWorkIds = existingWorkExperience.map((entry) => {
        if (!isRecord(entry)) return null;
        const idValue =
          entry.id ??
          entry.pk ??
          entry.work_experience_id ??
          entry.workExperienceId;
        return typeof idValue === "number" || typeof idValue === "string"
          ? idValue
          : null;
      });

      for (const [index, update] of workExperiencePayloads.entries()) {
        const entryId = update.id ?? existingWorkIds[index];
        if (entryId !== null && entryId !== undefined && entryId !== "") {
          await apiRequest(`/api/candidates/work-experience/${entryId}/`, {
            method: "PATCH",
            body: JSON.stringify(update.payload),
          });
        } else {
          await apiRequest("/api/candidates/work-experience/", {
            method: "POST",
            body: JSON.stringify(update.payload),
          });
        }
      }

      const deleteAllWorkExperience =
        userData.workExperience.experienceType === "fresher";
      const currentWorkIds = new Set(
        userData.workExperience.entries
          .map((entry) => entry.id)
          .filter((id) => id !== null && id !== undefined && id !== "")
          .map((id) => String(id))
      );
      const workExperienceDeletes = Array.from(
        new Set(
          existingWorkIds
            .filter(
              (id): id is number | string =>
                id !== null && id !== undefined && id !== ""
            )
            .map((id) => String(id))
            .filter((id) => deleteAllWorkExperience || !currentWorkIds.has(id))
        )
      );

      for (const id of workExperienceDeletes) {
        await apiRequest(`/api/candidates/work-experience/${id}/`, {
          method: "DELETE",
        });
      }

      const projectPayloads = buildCandidateProjectPayloads(userData);
      const existingProjectRecords = existingProjects
        .map((entry) => {
          if (!isRecord(entry)) {
            const name =
              typeof entry === "string" || typeof entry === "number"
                ? String(entry).trim()
                : "";
            return name ? { id: undefined, name } : null;
          }
          const name =
            typeof entry.project_name === "string"
              ? entry.project_name
              : typeof entry.projectName === "string"
              ? entry.projectName
              : typeof entry.name === "string"
              ? entry.name
              : typeof entry.title === "string"
              ? entry.title
              : "";
          const trimmedName = name.trim();
          const idValue =
            entry.id ?? entry.pk ?? entry.project_id ?? entry.projectId;
          const id =
            typeof idValue === "number" || typeof idValue === "string"
              ? idValue
              : undefined;
          const keySource = trimmedName || (id ? String(id) : "");
          if (!keySource) return null;
          return { id, name: trimmedName || keySource };
        })
        .filter(Boolean) as Array<{ id?: number | string; name: string }>;
      const existingProjectByKey = new Map<
        string,
        { id?: number | string; name: string }
      >();
      existingProjectRecords.forEach((record) => {
        const key = normalizeProjectKey(record.name);
        if (!key) return;
        if (!existingProjectByKey.has(key)) {
          existingProjectByKey.set(key, record);
        }
      });

      const projectMap = new Map<
        string,
        { id?: number | string; payload: Record<string, unknown> }
      >();
      projectPayloads.forEach((update) => {
        const key = normalizeProjectKey(update.payload.project_name);
        if (!key || projectMap.has(key)) return;
        projectMap.set(key, update);
      });

      for (const [key, update] of projectMap.entries()) {
        const resolvedId = update.id ?? existingProjectByKey.get(key)?.id;
        if (
          resolvedId !== null &&
          resolvedId !== undefined &&
          resolvedId !== ""
        ) {
          await apiRequest(`/api/candidates/projects/${resolvedId}/`, {
            method: "PATCH",
            body: JSON.stringify(update.payload),
          });
        } else {
          await apiRequest("/api/candidates/projects/", {
            method: "POST",
            body: JSON.stringify(update.payload),
          });
        }
      }

      const deleteAllProjects = userData.projects.noProjects;
      const projectDeletes = existingProjectRecords.filter((record) => {
        if (record.id === undefined || record.id === null || record.id === "") {
          return false;
        }
        if (deleteAllProjects) return true;
        const key = normalizeProjectKey(record.name);
        if (!key) return true;
        return !projectMap.has(key);
      });

      for (const record of projectDeletes) {
        await apiRequest(`/api/candidates/projects/${record.id}/`, {
          method: "DELETE",
        });
      }

      const achievementPayloads = buildCandidateAchievementPayloads(userData);
      const existingAchievementRecords = existingAchievements
        .map((entry) => {
          if (!isRecord(entry)) {
            const title =
              typeof entry === "string" || typeof entry === "number"
                ? String(entry).trim()
                : "";
            return title ? { id: undefined, title, issueDate: "" } : null;
          }
          const title =
            typeof entry.title === "string"
              ? entry.title
              : typeof entry.name === "string"
              ? entry.name
              : "";
          const issueDate =
            typeof entry.issue_date === "string"
              ? entry.issue_date
              : typeof entry.issueDate === "string"
              ? entry.issueDate
              : typeof entry.date === "string"
              ? entry.date
              : "";
          const trimmedTitle = title.trim();
          const trimmedIssueDate = issueDate.trim();
          const idValue =
            entry.id ?? entry.pk ?? entry.achievement_id ?? entry.achievementId;
          const id =
            typeof idValue === "number" || typeof idValue === "string"
              ? idValue
              : undefined;
          if (!trimmedTitle && !id) return null;
          return {
            id,
            title: trimmedTitle || (id ? String(id) : ""),
            issueDate: trimmedIssueDate,
          };
        })
        .filter(Boolean) as Array<{
        id?: number | string;
        title: string;
        issueDate: string;
      }>;

      const existingAchievementByKey = new Map<
        string,
        { id?: number | string; title: string; issueDate: string }
      >();
      existingAchievementRecords.forEach((record) => {
        const key = normalizeAchievementKey(record.title, record.issueDate);
        if (!key) return;
        if (!existingAchievementByKey.has(key)) {
          existingAchievementByKey.set(key, record);
        }
      });

      const achievementMap = new Map<
        string,
        { id?: number | string; payload: Record<string, unknown> }
      >();
      achievementPayloads.forEach((update) => {
        const key = normalizeAchievementKey(
          update.payload.title,
          update.payload.issue_date
        );
        if (!key || achievementMap.has(key)) return;
        achievementMap.set(key, update);
      });

      for (const [key, update] of achievementMap.entries()) {
        const resolvedId = update.id ?? existingAchievementByKey.get(key)?.id;
        if (
          resolvedId !== null &&
          resolvedId !== undefined &&
          resolvedId !== ""
        ) {
          await apiRequest(`/api/candidates/achievements/${resolvedId}/`, {
            method: "PATCH",
            body: JSON.stringify(update.payload),
          });
        } else {
          await apiRequest("/api/candidates/achievements/", {
            method: "POST",
            body: JSON.stringify(update.payload),
          });
        }
      }

      const achievementDeletes = existingAchievementRecords.filter((record) => {
        if (record.id === undefined || record.id === null || record.id === "") {
          return false;
        }
        const key = normalizeAchievementKey(record.title, record.issueDate);
        if (!key) return true;
        return !achievementMap.has(key);
      });

      for (const record of achievementDeletes) {
        await apiRequest(`/api/candidates/achievements/${record.id}/`, {
          method: "DELETE",
        });
      }

      const certificationPayloads =
        buildCandidateCertificationPayloads(userData);
      const existingCertificationRecords = existingCertifications
        .map((entry) => {
          if (!isRecord(entry)) {
            const name =
              typeof entry === "string" || typeof entry === "number"
                ? String(entry).trim()
                : "";
            return name ? { id: undefined, name, organization: "" } : null;
          }
          const name =
            typeof entry.name === "string"
              ? entry.name
              : typeof entry.title === "string"
              ? entry.title
              : typeof entry.certification_name === "string"
              ? entry.certification_name
              : typeof entry.certificationName === "string"
              ? entry.certificationName
              : "";
          const organization =
            typeof entry.issuing_organization === "string"
              ? entry.issuing_organization
              : typeof entry.organization === "string"
              ? entry.organization
              : typeof entry.issued_by === "string"
              ? entry.issued_by
              : typeof entry.issuedBy === "string"
              ? entry.issuedBy
              : typeof entry.issuer === "string"
              ? entry.issuer
              : "";
          const trimmedName = name.trim();
          const trimmedOrg = organization.trim();
          const idValue =
            entry.id ?? entry.pk ?? entry.certification_id ?? entry.certificationId;
          const id =
            typeof idValue === "number" || typeof idValue === "string"
              ? idValue
              : undefined;
          if (!trimmedName && !id) return null;
          return {
            id,
            name: trimmedName || (id ? String(id) : ""),
            organization: trimmedOrg,
          };
        })
        .filter(Boolean) as Array<{
        id?: number | string;
        name: string;
        organization: string;
      }>;

      const existingCertificationByKey = new Map<
        string,
        { id?: number | string; name: string; organization: string }
      >();
      existingCertificationRecords.forEach((record) => {
        const key = normalizeCertificationKey(
          record.name,
          record.organization
        );
        if (!key) return;
        if (!existingCertificationByKey.has(key)) {
          existingCertificationByKey.set(key, record);
        }
      });

      const certificationMap = new Map<
        string,
        { id?: number | string; payload: Record<string, unknown> }
      >();
      certificationPayloads.forEach((update) => {
        const key = normalizeCertificationKey(
          update.payload.name,
          update.payload.issuing_organization
        );
        if (!key || certificationMap.has(key)) return;
        certificationMap.set(key, update);
      });

      for (const [key, update] of certificationMap.entries()) {
        const resolvedId =
          update.id ?? existingCertificationByKey.get(key)?.id;
        if (
          resolvedId !== null &&
          resolvedId !== undefined &&
          resolvedId !== ""
        ) {
          await apiRequest(`/api/candidates/certifications/${resolvedId}/`, {
            method: "PATCH",
            body: JSON.stringify(update.payload),
          });
        } else {
          await apiRequest("/api/candidates/certifications/", {
            method: "POST",
            body: JSON.stringify(update.payload),
          });
        }
      }

      const deleteAllCertifications = userData.certification.noCertification;
      const certificationDeletes = existingCertificationRecords.filter(
        (record) => {
          if (
            record.id === undefined ||
            record.id === null ||
            record.id === ""
          ) {
            return false;
          }
          if (deleteAllCertifications) return true;
          const key = normalizeCertificationKey(
            record.name,
            record.organization
          );
          if (!key) return true;
          return !certificationMap.has(key);
        }
      );

      for (const record of certificationDeletes) {
        await apiRequest(`/api/candidates/certifications/${record.id}/`, {
          method: "DELETE",
        });
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

  const handleResumeUploadClick = () => {
    if (isUploadingResume) return;
    resumeInputRef.current?.click();
  };

  const handleResumeRemove = () => {
    setSelectedResumeName(null);
    setResumeUploadError(null);
    setResumeUploadSuccess(null);
    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }
  };

  const handleResumeUpload = async (file: File) => {
    if (!candidateSlug) {
      setResumeUploadError("Unable to upload resume. Missing profile details.");
      return;
    }

    setResumeUploadError(null);
    setResumeUploadSuccess(null);
    setIsUploadingResume(true);

    try {
      const formData = new FormData();
      formData.append("resume_file", file);

      await apiRequest(`/api/candidates/profiles/${candidateSlug}/`, {
        method: "PATCH",
        body: formData,
      });

      try {
        await apiRequest(
          `/api/candidates/profiles/${candidateSlug}/parsing-status/?include_resume=true`,
          { method: "GET" }
        );
      } catch (err) {
        console.warn(
          "[Profile Update] Unable to start resume parsing status check:",
          err
        );
      }

      setResumeUploadSuccess("Resume uploaded successfully.");
    } catch (err) {
      if (isApiError(err) && err.status === 401) {
        resetUserData();
        router.replace("/login-talent?next=/dashboard/profile-update");
        return;
      }
      setResumeUploadError("Failed to upload resume. Please try again.");
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleResumeFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isAllowedResumeFile(file)) {
      setResumeUploadError("Upload a PDF file.");
      setSelectedResumeName(null);
      event.target.value = "";
      return;
    }

    if (file.size > MAX_RESUME_FILE_SIZE) {
      setResumeUploadError("File size exceeds 10MB. Upload a smaller PDF.");
      setSelectedResumeName(null);
      event.target.value = "";
      return;
    }

    setSelectedResumeName(file.name);
    setResumeUploadError(null);
    handleResumeUpload(file);
  };

  const renderSection = (key: StepKey) => {
    switch (key) {
      case "basicInfo":
        return (
          <BasicInfo
            data={userData.basicInfo}
            errors={basicInfoErrors}
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
            errors={educationErrors}
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
            errors={workExpErrors}
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
            errors={skillErrors}
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
            errors={projectErrors}
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
            errors={certErrors}
            onToggleNoCertification={(value) =>
              setUserData((prev) => {
                const nextEntries = prev.certification.entries.length
                  ? prev.certification.entries
                  : [
                      {
                        name: "",
                        issueDate: "",
                        expiryDate: "",
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
                      expiryDate: "",
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
            errors={preferenceErrors}
            hideCompanySize
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
            errors={otherDetailsErrors}
            hideCareerStage
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

      <div className={cardClass}>
        <h2 className={titleClass}>Resume</h2>
        <p className="mt-2 text-base text-slate-600">
          Upload a new resume to replace your existing one.
        </p>
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <input
            ref={resumeInputRef}
            id="profile-resume-input"
            type="file"
            accept=".pdf,application/pdf"
            className="sr-only"
            disabled={isUploadingResume}
            aria-describedby="profile-resume-help"
            onChange={handleResumeFileChange}
          />
          <button
            type="button"
            onClick={handleResumeUploadClick}
            disabled={isUploadingResume}
            className="rounded-lg bg-[#D97706] px-6 py-2.5 text-base font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[#b76005] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isUploadingResume ? "Uploading..." : "Upload resume"}
          </button>
          <p
            id="profile-resume-help"
            className="mt-2 text-xs text-slate-400"
          >
            PDF only, max 10MB.
          </p>
          {selectedResumeName ? (
            <div className="mt-3 flex items-center justify-center gap-3 text-sm text-slate-600">
              <span>Selected: {selectedResumeName}</span>
              <button
                type="button"
                onClick={handleResumeRemove}
                disabled={isUploadingResume}
                className="text-slate-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Remove
              </button>
            </div>
          ) : null}
          {resumeUploadError ? (
            <p className="mt-3 text-sm font-medium text-red-600">
              {resumeUploadError}
            </p>
          ) : null}
          {resumeUploadSuccess ? (
            <p className="mt-3 text-sm font-medium text-emerald-600">
              {resumeUploadSuccess}
            </p>
          ) : null}
        </div>
      </div>

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
