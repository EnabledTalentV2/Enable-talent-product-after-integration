import type { StepKey, UserData } from "@/lib/types/user";

type Completion = { percent: number; isComplete: boolean };

const toCompletion = (isComplete: boolean): Completion => ({
  percent: isComplete ? 100 : 0,
  isComplete,
});

const isNonEmpty = (value: string | null | undefined) =>
  Boolean(value && value.trim().length > 0);

const areAllNonEmpty = (values: Array<string | null | undefined>) =>
  values.every(isNonEmpty);

const hasCompleteEntries = <T>(
  entries: T[],
  isComplete: (entry: T) => boolean
) => entries.length > 0 && entries.every(isComplete);

const isAccessibilityComplete = (data: UserData) =>
  Boolean(
    data.accessibilityNeeds &&
      isNonEmpty(data.accessibilityNeeds.accommodationNeed) &&
      isNonEmpty(data.accessibilityNeeds.disclosurePreference)
  );

const isBasicInfoComplete = (data: UserData) =>
  areAllNonEmpty([
    data.basicInfo.firstName,
    data.basicInfo.lastName,
    data.basicInfo.email,
    data.basicInfo.phone,
    data.basicInfo.location,
    data.basicInfo.citizenshipStatus,
    data.basicInfo.gender,
    data.basicInfo.ethnicity,
    data.basicInfo.currentStatus,
  ]);

const isEducationComplete = (data: UserData) =>
  areAllNonEmpty([
    data.education.courseName,
    data.education.major,
    data.education.institution,
  ]);

const isWorkEntryComplete = (
  entry: UserData["workExperience"]["entries"][number]
) =>
  areAllNonEmpty([entry.company, entry.role, entry.from]);

const isWorkExperienceComplete = (data: UserData) =>
  data.workExperience.experienceType === "fresher" ||
  hasCompleteEntries(data.workExperience.entries, isWorkEntryComplete);

const isSkillsComplete = (data: UserData) => {
  const primaryList = data.skills.primaryList ?? [];
  return primaryList.length > 0 || isNonEmpty(data.skills.skills);
};

const isProjectEntryComplete = (
  entry: UserData["projects"]["entries"][number]
) =>
  isNonEmpty(entry.projectName);

const isProjectsComplete = (data: UserData) =>
  data.projects.noProjects ||
  hasCompleteEntries(data.projects.entries, isProjectEntryComplete);

const isAchievementComplete = () => true;

const isCertificationEntryComplete = (
  entry: UserData["certification"]["entries"][number]
) =>
  isNonEmpty(entry.name);

const isCertificationComplete = (data: UserData) =>
  data.certification.noCertification ||
  hasCompleteEntries(data.certification.entries, isCertificationEntryComplete);

const isPreferenceComplete = (data: UserData) =>
  data.preference.jobType.length > 0 &&
  data.preference.jobSearch.length > 0;

const isLanguageComplete = (
  entry: UserData["otherDetails"]["languages"][number]
) =>
  areAllNonEmpty([
    entry.language,
    entry.speaking,
    entry.reading,
    entry.writing,
  ]);

const isOtherDetailsComplete = (data: UserData) =>
  hasCompleteEntries(data.otherDetails.languages, isLanguageComplete) &&
  areAllNonEmpty([
    data.otherDetails.availability,
    data.otherDetails.desiredSalary,
  ]);

const isReviewAgreeComplete = (data: UserData) => Boolean(data.reviewAgree.agree);

const computeStepCompletion = (data: UserData) => ({
  accessibilityNeeds: isAccessibilityComplete(data),
  basicInfo: isBasicInfoComplete(data),
  education: isEducationComplete(data),
  workExperience: isWorkExperienceComplete(data),
  skills: isSkillsComplete(data),
  projects: isProjectsComplete(data),
  achievements: isAchievementComplete(),
  certification: isCertificationComplete(data),
  preference: isPreferenceComplete(data),
  otherDetails: isOtherDetailsComplete(data),
  reviewAgree: isReviewAgreeComplete(data),
});

export const computeProfileSectionCompletion = (data: UserData) => {
  const steps = computeStepCompletion(data);

  return {
    basicInfo: toCompletion(steps.basicInfo),
    education: toCompletion(steps.education),
    workExperience: toCompletion(steps.workExperience),
    skills: toCompletion(steps.skills),
    projects: toCompletion(steps.projects),
    achievements: toCompletion(steps.achievements),
    certification: toCompletion(steps.certification),
    preference: toCompletion(steps.preference),
    otherDetails: toCompletion(steps.otherDetails),
    accessibilityNeeds: toCompletion(steps.accessibilityNeeds),
    reviewAgree: toCompletion(steps.reviewAgree),
  };
};

const dashboardProfileSections: StepKey[] = [
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

export const computeDashboardProfileCompletion = (data: UserData) => {
  const sections = computeProfileSectionCompletion(data);
  const totalSteps = dashboardProfileSections.length;
  const completedSteps = dashboardProfileSections.filter(
    (key) => sections[key]?.isComplete
  ).length;
  const percent =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return {
    percent,
    isComplete: totalSteps > 0 && completedSteps === totalSteps,
  };
};

export const computeProfileCompletion = (data: UserData) => {
  const steps = computeStepCompletion(data);
  const entries = Object.entries(steps).filter(
    ([key]) => key !== "achievements"
  );
  const totalSteps = entries.length;
  const completedSteps = entries.filter(([, isComplete]) => isComplete).length;
  const percent =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return {
    percent,
    isComplete: totalSteps > 0 && completedSteps === totalSteps,
  };
};
