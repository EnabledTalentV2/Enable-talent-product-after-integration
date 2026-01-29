"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/signup/Navbar";
import Header from "@/components/signup/Header";
import Sidebar from "@/components/signup/Sidebar";
import BasicInfo from "@/components/signup/forms/BasicInfo";
import Education from "@/components/signup/forms/Education";
import WorkExperience from "@/components/signup/forms/WorkExperience";
import ReviewAndAgree from "@/components/signup/forms/ReviewAndAgree";
import Skills from "@/components/signup/forms/Skills";
import Projects from "@/components/signup/forms/Projects";
import Achievements from "@/components/signup/forms/Achievements";
import Certification from "@/components/signup/forms/Certification";
import Preference from "@/components/signup/forms/Preference";
import OtherDetails from "@/components/signup/forms/OtherDetails";
import { useUserDataStore } from "@/lib/userDataStore";
import { computeProfileCompletion } from "@/lib/profileCompletion";
import { useFetchCandidateProfile } from "@/lib/hooks/useFetchCandidateProfile";
import {
  ensureCandidateProfileSlug,
  fetchCandidateProfileFull,
} from "@/lib/candidateProfile";
import { apiRequest, getApiErrorMessage, isApiError } from "@/lib/api-client";
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
import type { Step, StepKey, StepStatus, UserData } from "@/lib/types/user";
type WorkEntry = UserData["workExperience"]["entries"][number];
type ProjectEntry = UserData["projects"]["entries"][number];
type CertificationEntry = UserData["certification"]["entries"][number];
type LanguageEntry = UserData["otherDetails"]["languages"][number];

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
const skipUserProfilePatch = false;

const initialSteps: Step[] = [
  {
    id: 1,
    label: "Basic Info",
    key: "basicInfo",
    status: "pending",
    isActive: true,
  },
  { id: 2, label: "Education", key: "education", status: "pending" },
  { id: 3, label: "Work Experience", key: "workExperience", status: "pending" },
  { id: 4, label: "Skills", key: "skills", status: "pending" },
  { id: 5, label: "Projects", key: "projects", status: "pending" },
  { id: 6, label: "Achievements", key: "achievements", status: "pending" },
  { id: 7, label: "Certification", key: "certification", status: "pending" },
  { id: 8, label: "Preference", key: "preference", status: "pending" },
  { id: 9, label: "Other Details", key: "otherDetails", status: "pending" },
  { id: 10, label: "Review And Agree", key: "reviewAgree", status: "pending" },
];

export default function ManualResumeFill() {
  const router = useRouter();
  const [stepsState, setStepsState] = useState<Step[]>(initialSteps);
  const userData = useUserDataStore((s) => s.userData);
  const setUserData = useUserDataStore((s) => s.setUserData);
  const resetUserData = useUserDataStore((s) => s.resetUserData);
  const markSignupComplete = useUserDataStore((s) => s.markSignupComplete);
  const { fetchCandidateProfile } = useFetchCandidateProfile();
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [candidateSlug, setCandidateSlug] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const result = await fetchCandidateProfile();

        if (!result.data) {
          const nextPath = encodeURIComponent("/signup/manual-resume-fill");
          router.replace(`/login-talent?next=${nextPath}`);
          return;
        }

        if (!active) return;

        const { email, raw } = result.data;
        const resolvedSlug = await ensureCandidateProfileSlug({
          initialProfiles: raw,
          logLabel: "Manual Resume Fill",
        });

        if (!active) return;

        if (resolvedSlug) {
          setCandidateSlug(resolvedSlug);
        } else {
          setFinishError(
            "Unable to create your profile. Please refresh the page.",
          );
        }

        if (email) {
          setUserData((prev) => {
            if (prev.basicInfo.email) return prev;
            return {
              ...prev,
              basicInfo: { ...prev.basicInfo, email },
            };
          });
        }

        setLoading(false);
      } catch {
        const nextPath = encodeURIComponent("/signup/manual-resume-fill");
        router.replace(`/login-talent?next=${nextPath}`);
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, [fetchCandidateProfile, router, setUserData]);

  const hasCompletedAccessibility = Boolean(
    userData.accessibilityNeeds?.accommodationNeed &&
    userData.accessibilityNeeds?.disclosurePreference,
  );

  useEffect(() => {
    if (loading) return;
    if (!hasCompletedAccessibility) {
      router.replace("/signup/accessability-needs");
    }
  }, [hasCompletedAccessibility, loading, router]);

  const [finishError, setFinishError] = useState<string | null>(null);
  const [basicInfoErrors, setBasicInfoErrors] = useState<
    Partial<Record<keyof UserData["basicInfo"], string>>
  >({});
  const [basicInfoFirstError, setBasicInfoFirstError] = useState<string | null>(
    null,
  );
  const [educationErrors, setEducationErrors] = useState<
    Partial<Record<keyof UserData["education"], string>>
  >({});
  const [educationFirstError, setEducationFirstError] = useState<string | null>(
    null,
  );
  const [workExpErrors, setWorkExpErrors] = useState<{
    experienceType?: string;
    entries?: Record<
      number,
      Partial<
        Record<keyof UserData["workExperience"]["entries"][number], string>
      >
    >;
  }>({});
  const [workExpFirstError, setWorkExpFirstError] = useState<string | null>(
    null,
  );
  const [skillErrors, setSkillErrors] = useState<
    Partial<Record<keyof UserData["skills"], string>>
  >({});
  const [skillFirstError, setSkillFirstError] = useState<string | null>(null);
  const [projectErrors, setProjectErrors] = useState<{
    entries?: Record<number, Partial<Record<keyof ProjectEntry, string>>>;
  }>({});
  const [projectFirstError, setProjectFirstError] = useState<string | null>(
    null,
  );
  const [certErrors, setCertErrors] = useState<{
    entries?: Record<number, Partial<Record<keyof CertificationEntry, string>>>;
  }>({});
  const [certFirstError, setCertFirstError] = useState<string | null>(null);
  const [otherDetailsErrors, setOtherDetailsErrors] = useState<{
    languages?: Record<number, Partial<Record<keyof LanguageEntry, string>>>;
    careerStage?: string;
    availability?: string;
    desiredSalary?: string;
  }>({});
  const [otherDetailsFirstError, setOtherDetailsFirstError] = useState<
    string | null
  >(null);

  const activeIndex = stepsState.findIndex((s) => s.isActive);
  const activeStep = stepsState[activeIndex === -1 ? 0 : activeIndex];
  const profilePercent = useMemo(
    () => computeProfileCompletion(userData).percent,
    [userData],
  );
  const isLastStep = activeIndex === stepsState.length - 1;

  const setActiveStep = (nextIndex: number) => {
    setStepsState((prev) =>
      prev.map((step, idx) => ({
        ...step,
        isActive: idx === nextIndex,
      })),
    );
  };

  const updateStepStatus = (
    idx: number,
    status: StepStatus,
    errorText?: string,
  ) => {
    setStepsState((prev) =>
      prev.map((step, i) =>
        i === idx
          ? {
              ...step,
              status,
              errorText,
            }
          : step,
      ),
    );
  };

  const validateStep = (key: StepKey) => {
    switch (key) {
      case "basicInfo":
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
        const missing = requiredBasicFields.filter(
          ({ field }) => !userData.basicInfo[field],
        );
        if (missing.length) {
          const errs: Partial<Record<keyof UserData["basicInfo"], string>> = {};
          missing.forEach(({ field, message }) => {
            errs[field] = message;
          });
          setBasicInfoErrors((prev) => ({ ...prev, ...errs }));
          setBasicInfoFirstError(`basicInfo-${missing[0].field}`);
          return false;
        }

        // Validate website URL if provided
        if (userData.basicInfo.socialProfile) {
          const portfolioUrl = userData.basicInfo.socialProfile.trim();
          // Regex for verifying website URL (Strictly requires http:// or https://)
          const urlPattern =
            /^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
          if (!urlPattern.test(portfolioUrl)) {
            setBasicInfoErrors((prev) => ({
              ...prev,
              socialProfile:
                "Please enter a valid URL starting with http:// or https://",
            }));
            setBasicInfoFirstError("basicInfo-socialProfile");
            return false;
          }
        }

        // Validate LinkedIn URL if provided
        if (userData.basicInfo.linkedinUrl) {
          const linkedinUrl = userData.basicInfo.linkedinUrl.trim();
          // Regex for verifying LinkedIn URL (Strictly requires http:// or https://)
          const linkedinPattern = /^(https?:\/\/)(www\.)?linkedin\.com\/.*$/i;
          if (!linkedinPattern.test(linkedinUrl)) {
            setBasicInfoErrors((prev) => ({
              ...prev,
              linkedinUrl:
                "Please enter a valid LinkedIn URL starting with http:// or https://",
            }));
            setBasicInfoFirstError("basicInfo-linkedinUrl");
            return false;
          }
        }

        setBasicInfoErrors({});
        setBasicInfoFirstError(null);
        return true;
      case "education":
        const requiredEducationFields: Array<{
          field: keyof UserData["education"];
          message: string;
        }> = [
          { field: "courseName", message: "Please enter the Course Name" },
          { field: "major", message: "Please enter Major" },
          { field: "institution", message: "Please enter Institution" },
        ];
        const missingEdu = requiredEducationFields.filter(
          ({ field }) => !userData.education[field],
        );
        if (missingEdu.length) {
          const errs: Partial<Record<keyof UserData["education"], string>> = {};
          missingEdu.forEach(({ field, message }) => {
            errs[field] = message;
          });
          setEducationErrors((prev) => ({ ...prev, ...errs }));
          setEducationFirstError(`education-${missingEdu[0].field}`);
          return false;
        }
        setEducationErrors({});
        setEducationFirstError(null);
        return true;
      case "workExperience":
        if (userData.workExperience.experienceType === "fresher") {
          setWorkExpErrors({});
          setWorkExpFirstError(null);
          return true;
        }
        const requiredFields: Array<{
          field: keyof UserData["workExperience"]["entries"][number];
          message: string;
        }> = [
          { field: "company", message: "Please enter Company Name" },
          { field: "role", message: "Please enter Role" },
          { field: "from", message: "Please enter start date" },
        ];
        const entries = userData.workExperience.entries;
        const errors: typeof workExpErrors = { entries: {} };
        let firstId: string | null = null;
        if (!entries.length) {
          errors.entries = {
            0: {
              company: "Please enter Company Name",
              role: "Please enter Role",
              from: "Please enter start date",
            },
          };
          firstId = "workExp-0-company";
        }
        // Validate each entry
        entries.forEach((entry, idx) => {
          requiredFields.forEach(({ field, message }) => {
            const val = entry[field];
            const isValid =
              val && typeof val === "string" && val.trim().length > 0;

            if (!isValid) {
              if (!errors.entries) errors.entries = {};
              if (!errors.entries[idx]) errors.entries[idx] = {};
              errors.entries[idx]![field] = message;
              if (!firstId) {
                firstId = `workExp-${idx}-${field}`;
              }
            }
          });
          if (!entry.current) {
            const toVal = entry.to;
            const isToValid =
              toVal && typeof toVal === "string" && toVal.trim().length > 0;
            if (!isToValid) {
              if (!errors.entries) errors.entries = {};
              if (!errors.entries[idx]) errors.entries[idx] = {};
              errors.entries[idx]!.to = "Please enter end date";
              if (!firstId) {
                firstId = `workExp-${idx}-to`;
              }
            }
          }
        });
        const hasErrors = Boolean(firstId);
        if (hasErrors) {
          setWorkExpErrors((prev) => ({ ...prev, ...errors }));
          setWorkExpFirstError(firstId);
          return false;
        }
        setWorkExpErrors({});
        setWorkExpFirstError(null);
        return true;
      case "reviewAgree":
        return userData.reviewAgree.agree;
      case "skills":
        if (
          !userData.skills.primaryList ||
          userData.skills.primaryList.length === 0
        ) {
          setSkillErrors({ skills: "Please add at least one skill" });
          setSkillFirstError("skills-input");
          return false;
        }
        setSkillErrors({});
        setSkillFirstError(null);
        return true;
      case "projects":
        if (userData.projects.noProjects) {
          setProjectErrors({});
          setProjectFirstError(null);
          return true;
        }
        const requiredProjectFields: Array<{
          field: keyof ProjectEntry;
          message: string;
        }> = [{ field: "projectName", message: "Please enter Project name" }];
        const projectEntries = userData.projects.entries;
        const projectErrs: typeof projectErrors = { entries: {} };
        let firstProjectId: string | null = null;
        if (!projectEntries.length) {
          projectErrs.entries = {
            0: {
              projectName: "Please enter Project name",
            },
          };
          firstProjectId = "project-0-projectName";
        }
        projectEntries.forEach((entry, idx) => {
          requiredProjectFields.forEach(({ field, message }) => {
            if (field === "to" && entry.current) return;
            if (!entry[field]) {
              if (!projectErrs.entries) projectErrs.entries = {};
              if (!projectErrs.entries[idx]) projectErrs.entries[idx] = {};
              projectErrs.entries[idx]![field] = message;
              if (!firstProjectId) firstProjectId = `project-${idx}-${field}`;
            }
          });
        });
        if (firstProjectId) {
          setProjectErrors((prev) => ({ ...prev, ...projectErrs }));
          setProjectFirstError(firstProjectId);
          return false;
        }
        setProjectErrors({});
        setProjectFirstError(null);
        return true;
      case "certification":
        if (userData.certification.noCertification) {
          setCertErrors({});
          setCertFirstError(null);
          return true;
        }
        const requiredCertFields: Array<{
          field: keyof CertificationEntry;
          message: string;
        }> = [{ field: "name", message: "Please enter Name of certification" }];
        const certEntries = userData.certification.entries;
        const certErrs: typeof certErrors = { entries: {} };
        let firstCertId: string | null = null;
        if (!certEntries.length) {
          certErrs.entries = {
            0: {
              name: "Please enter Name of certification",
            },
          };
          firstCertId = "cert-0-name";
        }
        certEntries.forEach((entry, idx) => {
          requiredCertFields.forEach(({ field, message }) => {
            if (!entry[field]) {
              if (!certErrs.entries) certErrs.entries = {};
              if (!certErrs.entries[idx]) certErrs.entries[idx] = {};
              certErrs.entries[idx]![field] = message;
              if (!firstCertId) firstCertId = `cert-${idx}-${field}`;
            }
          });
        });
        if (firstCertId) {
          setCertErrors((prev) => ({ ...prev, ...certErrs }));
          setCertFirstError(firstCertId);
          return false;
        }
        setCertErrors({});
        setCertFirstError(null);
        return true;
      case "otherDetails":
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
            message: "Please select whether you are available immediately",
            id: "otherDetails-availability",
          },
          {
            field: "desiredSalary",
            message: "Please select desired salary",
            id: "otherDetails-desiredSalary",
          },
        ];

        const langEntries = userData.otherDetails.languages;
        const otherErrs: typeof otherDetailsErrors = { languages: {} };
        let firstOtherId: string | null = null;

        if (!langEntries.length) {
          otherErrs.languages = {
            0: {
              language: "Please select Language",
              speaking: "Please select Speaking level",
              reading: "Please select Reading level",
              writing: "Please select Writing level",
            },
          };
          firstOtherId = "otherDetails-lang-0-language";
        }

        langEntries.forEach((entry, idx) => {
          requiredLanguageFields.forEach(({ field, message }) => {
            if (!entry[field]) {
              if (!otherErrs.languages) otherErrs.languages = {};
              if (!otherErrs.languages[idx]) otherErrs.languages[idx] = {};
              otherErrs.languages[idx]![field] = message;
              if (!firstOtherId)
                firstOtherId = `otherDetails-lang-${idx}-${field}`;
            }
          });
        });

        requiredOtherFields.forEach(({ field, message, id }) => {
          if (!userData.otherDetails[field]) {
            (otherErrs as Record<string, string>)[field] = message;
            if (!firstOtherId) firstOtherId = id;
          }
        });

        if (firstOtherId) {
          const hasLanguageErrors =
            otherErrs.languages && Object.keys(otherErrs.languages).length > 0;
          if (!hasLanguageErrors) {
            delete otherErrs.languages;
          }
          setOtherDetailsErrors(otherErrs);
          setOtherDetailsFirstError(firstOtherId);
          return false;
        }

        setOtherDetailsErrors({});
        setOtherDetailsFirstError(null);
        return true;
      default:
        return true;
    }
  };

  const handleFinish = async () => {
    if (isUpdating) return;
    setFinishError(null);

    const email = userData.basicInfo.email.trim();

    if (!email) {
      setFinishError("Missing email. Please log in again.");
      return;
    }

    if (!candidateSlug) {
      setFinishError("Unable to save profile. Missing candidate information.");
      return;
    }

    const finalizedData = {
      ...userData,
      basicInfo: {
        ...userData.basicInfo,
        email,
      },
    };

    setIsUpdating(true);

    try {
      const firstName = finalizedData.basicInfo.firstName.trim();
      const lastName = finalizedData.basicInfo.lastName.trim();
      const personalProfile: Record<string, unknown> = {};
      const phone = finalizedData.basicInfo.phone.trim();
      const location = finalizedData.basicInfo.location.trim();
      const citizenshipStatus =
        finalizedData.basicInfo.citizenshipStatus.trim();
      const gender = normalizeGenderForBackend(finalizedData.basicInfo.gender);
      const ethnicity = finalizedData.basicInfo.ethnicity.trim();
      const linkedinUrl = finalizedData.basicInfo.linkedinUrl.trim();
      const githubUrl = finalizedData.basicInfo.githubUrl.trim();
      const portfolioUrl =
        finalizedData.basicInfo.portfolioUrl.trim() ||
        finalizedData.basicInfo.socialProfile.trim();
      const currentStatus = finalizedData.basicInfo.currentStatus.trim();

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

      const profilePayload = buildCandidateProfileCorePayload(finalizedData);
      const hasPayload = Object.keys(profilePayload).length > 0;
      if (hasPayload) {
        await apiRequest(`/api/candidates/profiles/${candidateSlug}/`, {
          method: "PATCH",
          body: JSON.stringify(profilePayload),
        });
      }

      const fullProfile = await fetchCandidateProfileFull(
        candidateSlug,
        "Manual Resume Fill",
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
        verifiedProfile?.work_experience,
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
                        (workExperienceContainer as Record<string, unknown>)
                          ?.entries,
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
              : Array.isArray(
                    (projectsContainer as Record<string, unknown>)?.entries,
                  )
                ? ((projectsContainer as Record<string, unknown>)
                    ?.entries as unknown[])
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
                        (achievementsContainer as Record<string, unknown>)
                          ?.entries,
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
        verifiedProfile?.certifications,
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
                        (certificationsContainer as Record<string, unknown>)
                          ?.entries,
                      )
                    ? ((certificationsContainer as Record<string, unknown>)
                        ?.entries as unknown[])
                    : [];

      const educationPayloads = buildCandidateEducationPayloads(
        finalizedData,
        existingEducation,
      );
      for (const payload of educationPayloads) {
        await apiRequest("/api/candidates/education/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      const skillPayloads = buildCandidateSkillPayloads(
        finalizedData,
        existingSkills,
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
      (finalizedData.skills.primaryList ?? []).forEach((skill) => {
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
        if (existingRecord && normalizeSkillKey(existingRecord.name) === key) {
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
        finalizedData,
        existingLanguages,
      );
      for (const payload of languagePayloads) {
        await apiRequest("/api/candidates/languages/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      const workExperiencePayloads =
        buildCandidateWorkExperiencePayloads(finalizedData);
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
        finalizedData.workExperience.experienceType === "fresher";
      const currentWorkIds = new Set(
        finalizedData.workExperience.entries
          .map((entry) => entry.id)
          .filter((id) => id !== null && id !== undefined && id !== "")
          .map((id) => String(id)),
      );
      const workExperienceDeletes = Array.from(
        new Set(
          existingWorkIds
            .filter(
              (id): id is number | string =>
                id !== null && id !== undefined && id !== "",
            )
            .map((id) => String(id))
            .filter((id) => deleteAllWorkExperience || !currentWorkIds.has(id)),
        ),
      );

      for (const id of workExperienceDeletes) {
        await apiRequest(`/api/candidates/work-experience/${id}/`, {
          method: "DELETE",
        });
      }

      const projectPayloads = buildCandidateProjectPayloads(finalizedData);
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

      const deleteAllProjects = finalizedData.projects.noProjects;
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

      const achievementPayloads =
        buildCandidateAchievementPayloads(finalizedData);
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
          update.payload.issue_date,
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
        buildCandidateCertificationPayloads(finalizedData);
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
            entry.id ??
            entry.pk ??
            entry.certification_id ??
            entry.certificationId;
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
        const key = normalizeCertificationKey(record.name, record.organization);
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
          update.payload.issuing_organization,
        );
        if (!key || certificationMap.has(key)) return;
        certificationMap.set(key, update);
      });

      for (const [key, update] of certificationMap.entries()) {
        const resolvedId = update.id ?? existingCertificationByKey.get(key)?.id;
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

      const deleteAllCertifications =
        finalizedData.certification.noCertification;
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
            record.organization,
          );
          if (!key) return true;
          return !certificationMap.has(key);
        },
      );

      for (const record of certificationDeletes) {
        await apiRequest(`/api/candidates/certifications/${record.id}/`, {
          method: "DELETE",
        });
      }

      setUserData((prev) => finalizedData as typeof prev);
      markSignupComplete();
      router.push("/dashboard");
    } catch (err) {
      if (isApiError(err) && err.status === 401) {
        resetUserData();
        const nextPath = encodeURIComponent("/signup/manual-resume-fill");
        router.replace(`/login-talent?next=${nextPath}`);
        return;
      }
      const message = getApiErrorMessage(
        err,
        "Unable to complete signup. Please try again.",
      );
      setFinishError(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveAndNext = async () => {
    if (activeIndex === -1 || isUpdating) return;
    const isValid = validateStep(activeStep.key);

    if (!isValid) {
      updateStepStatus(activeIndex, "error", "Please complete required fields");
      return;
    }

    if (activeIndex === stepsState.length - 1) {
      updateStepStatus(activeIndex, "completed");
      await handleFinish();
      return;
    }

    setStepsState((prev) =>
      prev.map((step, idx) => {
        if (idx === activeIndex) {
          return {
            ...step,
            status: "completed",
            isActive: false,
            errorText: undefined,
          };
        }
        if (idx === activeIndex + 1) {
          return { ...step, isActive: true };
        }
        return step;
      }),
    );
  };

  const handlePrevious = () => {
    if (activeIndex <= 0) return;
    setActiveStep(activeIndex - 1);
  };

  const renderForm = useMemo(() => {
    switch (activeStep.key) {
        case "basicInfo":
          return (
            <BasicInfo
              data={userData.basicInfo}
              errors={basicInfoErrors}
              hideProfilePhoto
              onChange={(patch) => {
                setUserData((prev) => ({
                  ...prev,
                  basicInfo: { ...prev.basicInfo, ...patch },
              }));
              setBasicInfoErrors((prev) => {
                const cleared = { ...prev };
                (Object.keys(patch) as (keyof typeof patch)[]).forEach(
                  (key) => {
                    if (patch[key]) {
                      delete (cleared as Record<string, string>)[key as string];
                    }
                  },
                );
                return cleared;
              });
              setBasicInfoFirstError((prev) => {
                if (!prev) return prev;
                const firstKey = prev.replace(
                  "basicInfo-",
                  "",
                ) as keyof UserData["basicInfo"];
                const updatedKeys = Object.keys(
                  patch,
                ) as (keyof typeof patch)[];
                if (updatedKeys.includes(firstKey) && patch[firstKey]) {
                  return null;
                }
                return prev;
              });
            }}
          />
        );
      case "education":
        return (
          <Education
            data={userData.education}
            errors={educationErrors}
            onChange={(patch) => {
              setUserData((prev) => ({
                ...prev,
                education: { ...prev.education, ...patch },
              }));
              setEducationErrors((prev) => {
                const cleared = { ...prev };
                (Object.keys(patch) as (keyof typeof patch)[]).forEach(
                  (key) => {
                    if (patch[key]) {
                      delete (cleared as Record<string, string>)[key as string];
                    }
                  },
                );
                return cleared;
              });
              setEducationFirstError((prev) => {
                if (!prev) return prev;
                const firstKey = prev.replace(
                  "education-",
                  "",
                ) as keyof UserData["education"];
                const updatedKeys = Object.keys(
                  patch,
                ) as (keyof typeof patch)[];
                if (updatedKeys.includes(firstKey) && patch[firstKey]) {
                  return null;
                }
                return prev;
              });
            }}
          />
        );
      case "workExperience":
        return (
          <WorkExperience
            data={userData.workExperience}
            errors={workExpErrors}
            onExperienceTypeChange={(experienceType) => {
              setUserData((prev) => ({
                ...prev,
                workExperience: {
                  ...prev.workExperience,
                  experienceType,
                },
              }));
              if (experienceType === "fresher") {
                setWorkExpErrors({});
                setWorkExpFirstError(null);
              }
            }}
            onEntryChange={(index, patch) => {
              setUserData((prev) => {
                const nextEntries = prev.workExperience.entries.map(
                  (entry, idx) =>
                    idx === index ? { ...entry, ...patch } : entry,
                );
                return {
                  ...prev,
                  workExperience: {
                    ...prev.workExperience,
                    entries: nextEntries,
                  },
                };
              });
              setWorkExpErrors((prev) => {
                const cleared = { ...prev };
                if (cleared.entries && cleared.entries[index]) {
                  const updated = {
                    ...(cleared.entries[index] as Record<string, string>),
                  };
                  (Object.keys(patch) as (keyof typeof patch)[]).forEach(
                    (key) => {
                      if (patch[key]) {
                        delete updated[key as string];
                      }
                    },
                  );
                  if (patch.current === true) {
                    delete updated.to;
                  }
                  cleared.entries = { ...cleared.entries, [index]: updated };
                }
                return cleared;
              });
              setWorkExpFirstError((prev) => {
                if (!prev) return prev;
                const [, idxStr, field] = prev.split("-");
                const idxNum = Number(idxStr);
                if (
                  idxNum === index &&
                  field === "to" &&
                  patch.current === true
                ) {
                  return null;
                }
                if (
                  idxNum === index &&
                  (Object.keys(patch) as string[]).includes(field) &&
                  patch[field as keyof WorkEntry]
                ) {
                  return null;
                }
                return prev;
              });
            }}
            onAddEntry={() => {
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
              }));
            }}
            onRemoveEntry={(index) => {
              setUserData((prev) => {
                const nextEntries = prev.workExperience.entries.filter(
                  (_, idx) => idx !== index,
                );
                return {
                  ...prev,
                  workExperience: {
                    ...prev.workExperience,
                    entries: nextEntries,
                  },
                };
              });
              setWorkExpErrors({});
              setWorkExpFirstError(null);
            }}
          />
        );
      case "skills":
        return (
          <Skills
            data={userData.skills}
            errors={skillErrors}
            onChange={(patch) => {
              setUserData((prev) => ({
                ...prev,
                skills: { ...prev.skills, ...patch },
              }));
              setSkillErrors((prev) => {
                const cleared = { ...prev };
                if (
                  typeof patch.skills === "string" &&
                  patch.skills.trim().length > 0
                ) {
                  delete (cleared as Record<string, string>).skills;
                }
                if ("primaryList" in patch) {
                  delete (cleared as Record<string, string>).skills;
                }
                return cleared;
              });
              setSkillFirstError((prev) => {
                if (!prev) return prev;
                if (
                  typeof patch.skills === "string" &&
                  patch.skills.trim().length > 0
                )
                  return null;
                if ("primaryList" in patch) return null;
                return prev;
              });
            }}
          />
        );
      case "projects":
        return (
          <Projects
            data={userData.projects}
            errors={projectErrors}
            onNoProjectsChange={(val) => {
              setUserData((prev) => ({
                ...prev,
                projects: { ...prev.projects, noProjects: val },
              }));
              if (val) {
                setProjectErrors({});
                setProjectFirstError(null);
              }
            }}
            onEntryChange={(index, patch) => {
              setUserData((prev) => {
                const nextEntries = prev.projects.entries.map((entry, idx) =>
                  idx === index ? { ...entry, ...patch } : entry,
                );
                return {
                  ...prev,
                  projects: { ...prev.projects, entries: nextEntries },
                };
              });
              setProjectErrors((prev) => {
                const cleared = { ...prev };
                if (cleared.entries && cleared.entries[index]) {
                  const updated = {
                    ...(cleared.entries[index] as Record<string, string>),
                  };
                  (Object.keys(patch) as (keyof typeof patch)[]).forEach(
                    (key) => {
                      if (patch[key]) {
                        delete updated[key as string];
                      }
                    },
                  );
                  if (patch.current === true) {
                    delete updated.to;
                  }
                  cleared.entries = { ...cleared.entries, [index]: updated };
                }
                return cleared;
              });
              setProjectFirstError((prev) => {
                if (!prev) return prev;
                const [, idxStr, field] = prev.split("-");
                const idxNum = Number(idxStr);
                if (
                  idxNum === index &&
                  field === "to" &&
                  patch.current === true
                ) {
                  return null;
                }
                if (
                  idxNum === index &&
                  (Object.keys(patch) as string[]).includes(field) &&
                  patch[field as keyof ProjectEntry]
                ) {
                  return null;
                }
                return prev;
              });
            }}
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
            onRemoveEntry={(index) => {
              setUserData((prev) => {
                const nextEntries = prev.projects.entries.filter(
                  (_, idx) => idx !== index,
                );
                return {
                  ...prev,
                  projects: { ...prev.projects, entries: nextEntries },
                };
              });
              setProjectErrors({});
              setProjectFirstError(null);
            }}
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
                    idx === index ? { ...entry, ...patch } : entry,
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
                  (_, idx) => idx !== index,
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
            suppressDeleteWarning
            onToggleNoCertification={(value) => {
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
              });
              if (value) {
                setCertErrors({});
                setCertFirstError(null);
              }
            }}
            onEntryChange={(index, patch) => {
              setUserData((prev) => {
                const nextEntries = prev.certification.entries.map(
                  (entry, idx) =>
                    idx === index ? { ...entry, ...patch } : entry,
                );
                return {
                  ...prev,
                  certification: {
                    ...prev.certification,
                    entries: nextEntries,
                  },
                };
              });
              setCertErrors((prev) => {
                const cleared = { ...prev };
                if (cleared.entries && cleared.entries[index]) {
                  const updated = {
                    ...(cleared.entries[index] as Record<string, string>),
                  };
                  (Object.keys(patch) as (keyof typeof patch)[]).forEach(
                    (key) => {
                      if (patch[key]) {
                        delete updated[key as string];
                      }
                    },
                  );
                  cleared.entries = { ...cleared.entries, [index]: updated };
                }
                return cleared;
              });
              setCertFirstError((prev) => {
                if (!prev) return prev;
                const [, idxStr, field] = prev.split("-");
                const idxNum = Number(idxStr);
                if (
                  idxNum === index &&
                  (Object.keys(patch) as string[]).includes(field) &&
                  patch[field as keyof CertificationEntry]
                ) {
                  return null;
                }
                return prev;
              });
            }}
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
            onRemoveEntry={(index) => {
              setUserData((prev) => {
                const nextEntries = prev.certification.entries.filter(
                  (_, idx) => idx !== index,
                );
                return {
                  ...prev,
                  certification: {
                    ...prev.certification,
                    entries: nextEntries,
                  },
                };
              });
              setCertErrors({});
              setCertFirstError(null);
            }}
          />
        );
      case "preference":
        return (
          <Preference
            data={userData.preference}
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
            onChange={(patch) => {
              setUserData((prev) => ({
                ...prev,
                otherDetails: { ...prev.otherDetails, ...patch },
              }));
              setOtherDetailsErrors((prev) => {
                const cleared = { ...prev };
                (Object.keys(patch) as (keyof typeof patch)[]).forEach(
                  (key) => {
                    if (patch[key]) {
                      delete (cleared as Record<string, unknown>)[
                        key as string
                      ];
                    }
                  },
                );
                return cleared;
              });
              setOtherDetailsFirstError((prev) => {
                if (!prev) return prev;
                const updatedKeys = Object.keys(patch) as Array<
                  keyof typeof patch
                >;
                if (
                  updatedKeys.some(
                    (key) =>
                      prev === `otherDetails-${String(key)}` && patch[key],
                  )
                ) {
                  return null;
                }
                return prev;
              });
            }}
            onLanguageChange={(index, patch) => {
              setUserData((prev) => {
                const nextLanguages = prev.otherDetails.languages.map(
                  (entry, idx) =>
                    idx === index ? { ...entry, ...patch } : entry,
                );
                return {
                  ...prev,
                  otherDetails: {
                    ...prev.otherDetails,
                    languages: nextLanguages,
                  },
                };
              });
              setOtherDetailsErrors((prev) => {
                const cleared = { ...prev };
                if (cleared.languages && cleared.languages[index]) {
                  const updated = {
                    ...(cleared.languages[index] as Record<string, string>),
                  };
                  (Object.keys(patch) as (keyof typeof patch)[]).forEach(
                    (key) => {
                      if (patch[key]) {
                        delete updated[key as string];
                      }
                    },
                  );
                  cleared.languages = {
                    ...cleared.languages,
                    [index]: updated,
                  };
                }
                return cleared;
              });
              setOtherDetailsFirstError((prev) => {
                if (!prev) return prev;
                const parts = prev.split("-");
                if (parts[0] === "otherDetails" && parts[1] === "lang") {
                  const idxNum = Number(parts[2]);
                  const field = parts[3] as keyof LanguageEntry;
                  if (
                    idxNum === index &&
                    (Object.keys(patch) as string[]).includes(field) &&
                    patch[field]
                  ) {
                    return null;
                  }
                }
                return prev;
              });
            }}
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
            onRemoveLanguage={(index) => {
              setUserData((prev) => {
                const nextLanguages = prev.otherDetails.languages.filter(
                  (_, idx) => idx !== index,
                );
                return {
                  ...prev,
                  otherDetails: {
                    ...prev.otherDetails,
                    languages: nextLanguages,
                  },
                };
              });
              setOtherDetailsErrors({});
              setOtherDetailsFirstError(null);
            }}
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
  }, [
    activeStep.key,
    userData,
    setUserData,
    basicInfoErrors,
    educationErrors,
    workExpErrors,
    skillErrors,
    projectErrors,
    certErrors,
    otherDetailsErrors,
  ]);

  useEffect(() => {
    if (basicInfoFirstError && activeStep.key === "basicInfo") {
      const el = document.getElementById(basicInfoFirstError);
      if (el instanceof HTMLElement) {
        el.focus({ preventScroll: false });
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [basicInfoFirstError, activeStep.key]);

  useEffect(() => {
    if (educationFirstError && activeStep.key === "education") {
      const el = document.getElementById(educationFirstError);
      if (el instanceof HTMLElement) {
        el.focus({ preventScroll: false });
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [educationFirstError, activeStep.key]);

  useEffect(() => {
    if (workExpFirstError && activeStep.key === "workExperience") {
      const el = document.getElementById(workExpFirstError);
      if (el instanceof HTMLElement) {
        el.focus({ preventScroll: false });
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [workExpFirstError, activeStep.key]);

  useEffect(() => {
    if (skillFirstError && activeStep.key === "skills") {
      const el = document.getElementById(skillFirstError);
      if (el instanceof HTMLElement) {
        el.focus({ preventScroll: false });
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [skillFirstError, activeStep.key]);

  useEffect(() => {
    if (projectFirstError && activeStep.key === "projects") {
      const el = document.getElementById(projectFirstError);
      if (el instanceof HTMLElement) {
        el.focus({ preventScroll: false });
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [projectFirstError, activeStep.key]);

  useEffect(() => {
    if (certFirstError && activeStep.key === "certification") {
      const el = document.getElementById(certFirstError);
      if (el instanceof HTMLElement) {
        el.focus({ preventScroll: false });
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [certFirstError, activeStep.key]);

  useEffect(() => {
    if (otherDetailsFirstError && activeStep.key === "otherDetails") {
      const el = document.getElementById(otherDetailsFirstError);
      if (el instanceof HTMLElement) {
        el.focus({ preventScroll: false });
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [otherDetailsFirstError, activeStep.key]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EFF6FF]">
        <div className="text-slate-500">Verifying session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFF6FF] text-slate-800 flex flex-col">
      <Navbar />

      <div className="flex-1 px-4 py-6 md:px-10 md:py-10 flex justify-center">
        <div className="max-w-7xl w-full flex flex-col gap-6">
          <Header percent={profilePercent} />

          <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <Sidebar steps={stepsState} />

            <main className="md:col-span-9 bg-white rounded-3xl p-8 md:p-10 shadow-lg">
              <div className="flex items-start justify-between gap-4 mb-8">
                <div>
                  <p className="text-base text-slate-500">
                    Step {activeStep.id}
                  </p>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {activeStep.label}
                  </h2>
                </div>
                <div className="hidden md:flex items-center gap-2 text-base text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Profile completion tracking</span>
                </div>
              </div>

              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                {renderForm}

                {finishError ? (
                  <p className="text-base font-medium text-red-600">
                    {finishError}
                  </p>
                ) : null}

                <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                    disabled={activeIndex === 0}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAndNext}
                    className="px-6 py-2.5 bg-[#C27528] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      isUpdating ||
                      (activeStep.key === "reviewAgree" &&
                        !userData.reviewAgree.agree)
                    }
                  >
                    {isUpdating && isLastStep
                      ? "Finishing..."
                      : isLastStep
                        ? "Finish"
                        : "Save & Next"}
                  </button>
                </div>
              </form>
            </main>
          </section>
        </div>
      </div>
    </div>
  );
}
