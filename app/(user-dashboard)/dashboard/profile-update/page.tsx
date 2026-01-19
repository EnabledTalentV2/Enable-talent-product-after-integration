"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserDataStore } from "@/lib/userDataStore";
import { apiRequest, isApiError } from "@/lib/api-client";
import {
  computeProfileCompletion,
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
  buildCandidateEducationPayloads,
  buildCandidateLanguagePayloads,
  buildCandidateProfileCorePayload,
  buildCandidateSkillPayloads,
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
  otherDetailsErrors: {
    languages?: Record<number, Partial<Record<keyof LanguageEntry, string>>>;
    careerStage?: string;
    availability?: string;
    desiredSalary?: string;
  };
  reviewAgreeError: string | null;
  firstErrorId: string | null;
  hasErrors: boolean;
};

const isBlank = (value: string | undefined) =>
  !value || value.trim().length === 0;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const appendFormValue = (
  formData: FormData,
  key: string,
  value: unknown
) => {
  if (value === null || value === undefined) return;
  if (Array.isArray(value) || typeof value === "object") {
    formData.append(key, JSON.stringify(value));
    return;
  }
  formData.append(key, String(value));
};

const buildResumeFormData = (
  payload: Record<string, unknown>,
  resumeFile: File
) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    appendFormValue(formData, key, value);
  });
  formData.append("resume_file", resumeFile, resumeFile.name);
  return formData;
};

const validateRequiredFields = (data: UserData): RequiredValidationResult => {
  const basicInfoErrors: RequiredValidationResult["basicInfoErrors"] = {};
  const educationErrors: RequiredValidationResult["educationErrors"] = {};
  const workExpErrors: RequiredValidationResult["workExpErrors"] = {};
  const skillErrors: RequiredValidationResult["skillErrors"] = {};
  const projectErrors: RequiredValidationResult["projectErrors"] = {};
  const certErrors: RequiredValidationResult["certErrors"] = {};
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
      { field: "description", message: "Please enter Description" },
    ];

    const workEntries = data.workExperience.entries;
    if (workEntries.length === 0) {
      workExpErrors.entries = {
        0: {
          company: "Please enter Company Name",
          role: "Please enter Role",
          from: "Please enter start date",
          to: "Please enter end date",
          description: "Please enter Description",
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

      if (!entry.current && isBlank(entry.to)) {
        if (!workExpErrors.entries) workExpErrors.entries = {};
        if (!workExpErrors.entries[idx]) workExpErrors.entries[idx] = {};
        workExpErrors.entries[idx]!.to = "Please enter end date";
        hasErrors = true;
        if (!firstErrorId) firstErrorId = `workExp-${idx}-to`;
      }
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
      {
        field: "projectDescription",
        message: "Please enter Project description",
      },
      { field: "from", message: "Please enter start date" },
      { field: "to", message: "Please enter end date" },
    ];

    const projectEntries = data.projects.entries;
    if (projectEntries.length === 0) {
      projectErrors.entries = {
        0: {
          projectName: "Please enter Project name",
          projectDescription: "Please enter Project description",
          from: "Please enter start date",
          to: "Please enter end date",
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
      { field: "issueDate", message: "Please enter Issue Date" },
      { field: "organization", message: "Please enter Issued organization" },
      {
        field: "credentialIdUrl",
        message: "Please enter Credential ID/URL",
      },
    ];

    const certEntries = data.certification.entries;
    if (certEntries.length === 0) {
      certErrors.entries = {
        0: {
          name: "Please enter Name of certification",
          issueDate: "Please enter Issue Date",
          organization: "Please enter Issued organization",
          credentialIdUrl: "Please enter Credential ID/URL",
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
      "careerStage" | "availability" | "desiredSalary"
    >;
    message: string;
    id: string;
  }> = [
    {
      field: "careerStage",
      message: "Please select your career stage",
      id: "otherDetails-careerStage",
    },
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

  const reviewAgreeError = data.reviewAgree.agree
    ? null
    : "Please accept the terms and conditions.";
  if (reviewAgreeError) {
    hasErrors = true;
  }

  return {
    basicInfoErrors,
    educationErrors,
    workExpErrors,
    skillErrors,
    projectErrors,
    certErrors,
    otherDetailsErrors,
    reviewAgreeError,
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
  const candidateProfile = useCandidateProfileStore((s) => s.profile);
  const candidateSlug = useCandidateProfileStore((s) => s.slug);
  const setCandidateSlug = useCandidateProfileStore((s) => s.setSlug);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeInputKey, setResumeInputKey] = useState(0);
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
  const [otherDetailsErrors, setOtherDetailsErrors] = useState<{
    languages?: Record<number, Partial<Record<keyof LanguageEntry, string>>>;
    careerStage?: string;
    availability?: string;
    desiredSalary?: string;
  }>({});
  const [reviewAgreeError, setReviewAgreeError] = useState<string | null>(null);

  const validationMessage = "Please complete required fields before saving.";

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
  const currentResumeUrl = useMemo(() => {
    if (!candidateProfile || typeof candidateProfile !== "object") return "";
    const record = candidateProfile as Record<string, unknown>;
    const resumeFile = record.resume_file ?? record.resume_url;
    return typeof resumeFile === "string" ? resumeFile : "";
  }, [candidateProfile]);

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
    setOtherDetailsErrors(validation.otherDetailsErrors);
    setReviewAgreeError(validation.reviewAgreeError);

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
    setOtherDetailsErrors(validation.otherDetailsErrors);
    setReviewAgreeError(validation.reviewAgreeError);
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
      if (firstName || lastName) {
        await apiRequest("/api/users/profile/", {
          method: "PATCH",
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
          }),
        });
      }

      const profilePayload = buildCandidateProfileCorePayload(userData);
      const hasPayload = Object.keys(profilePayload).length > 0;
      const hasResumeFile = Boolean(resumeFile);

      if (hasPayload) {
        await apiRequest<unknown>(
          `/api/candidates/profiles/${candidateSlug}/`,
          {
            method: "PATCH",
            body: JSON.stringify(profilePayload),
          }
        );
      }

      if (hasResumeFile) {
        const body = buildResumeFormData({}, resumeFile as File);
        await apiRequest<unknown>(
          `/api/candidates/profiles/${candidateSlug}/`,
          {
            method: "PATCH",
            body,
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
      const existingEducation = Array.isArray(verifiedProfile?.education)
        ? verifiedProfile.education
        : [];
      const existingSkills = Array.isArray(verifiedProfile?.skills)
        ? verifiedProfile.skills
        : [];
      const existingLanguages = Array.isArray(verifiedProfile?.languages)
        ? verifiedProfile.languages
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

      setSaveSuccess("Profile saved.");
      if (hasResumeFile) {
        setResumeFile(null);
        setResumeInputKey((key) => key + 1);
      }
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
            errors={otherDetailsErrors}
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
          <div className="space-y-3">
            <ReviewAndAgree
              data={userData.reviewAgree}
              onChange={(patch) =>
                setUserData((prev) => ({
                  ...prev,
                  reviewAgree: { ...prev.reviewAgree, ...patch },
                }))
              }
            />
            {reviewAgreeError ? (
              <p className="text-sm font-medium text-red-600">
                {reviewAgreeError}
              </p>
            ) : null}
          </div>
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
          Upload a new resume file to replace your current one.
        </p>
        {currentResumeUrl ? (
          <p className="mt-2 text-sm text-slate-700">
            Current resume:{" "}
            <a
              href={currentResumeUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-slate-900 underline"
            >
              View file
            </a>
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No resume on file.</p>
        )}
        <div className="mt-4 space-y-2">
          <label
            htmlFor="resume-file"
            className="text-sm font-medium text-slate-700"
          >
            Upload new resume
          </label>
          <input
            key={resumeInputKey}
            id="resume-file"
            type="file"
            accept=".pdf,application/pdf"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setResumeFile(file);
            }}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
          />
          {resumeFile ? (
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span>Selected: {resumeFile.name}</span>
              <button
                type="button"
                onClick={() => {
                  setResumeFile(null);
                  setResumeInputKey((key) => key + 1);
                }}
                className="text-slate-500 underline hover:text-slate-700"
              >
                Clear selection
              </button>
            </div>
          ) : null}
          <p className="text-xs text-slate-500">
            Accepted file type: PDF.
          </p>
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
