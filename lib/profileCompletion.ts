import type { UserData } from "@/components/signup/types";

type Counts = { total: number; filled: number };
type SectionCounts = {
  basicInfo: Counts;
  education: Counts;
  workExperience: Counts;
  skills: Counts;
  projects: Counts;
  achievements: Counts;
  certification: Counts;
  preference: Counts;
  otherDetails: Counts;
  reviewAgree: Counts;
};

const countValue = (value: unknown): Counts => {
  if (value === null || value === undefined) {
    return { total: 1, filled: 0 };
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return { total: 1, filled: trimmed.length > 0 ? 1 : 0 };
  }

  if (typeof value === "number") {
    return { total: 1, filled: Number.isNaN(value) ? 0 : 1 };
  }

  if (typeof value === "boolean") {
    return { total: 1, filled: value ? 1 : 0 };
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { total: 1, filled: 0 };
    }

    return value.reduce(
      (acc, item) => {
        const next = countValue(item);
        return {
          total: acc.total + next.total,
          filled: acc.filled + next.filled,
        };
      },
      { total: 0, filled: 0 }
    );
  }

  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).reduce<Counts>(
      (acc, item) => {
        const next = countValue(item);
        return {
          total: acc.total + next.total,
          filled: acc.filled + next.filled,
        };
      },
      { total: 0, filled: 0 }
    );
  }

  return { total: 1, filled: 0 };
};

const combineCounts = (...counts: Counts[]) =>
  counts.reduce(
    (acc, next) => ({
      total: acc.total + next.total,
      filled: acc.filled + next.filled,
    }),
    { total: 0, filled: 0 }
  );

const toCompletion = (counts: Counts) => {
  const percent =
    counts.total > 0
      ? Math.min(100, Math.round((counts.filled / counts.total) * 100))
      : 0;
  return {
    percent,
    isComplete: counts.total > 0 && counts.filled === counts.total,
  };
};

const computeSectionCounts = (data: UserData): SectionCounts => {
  const workExperienceCounts =
    data.workExperience.experienceType === "fresher"
      ? countValue({ experienceType: data.workExperience.experienceType })
      : combineCounts(
          countValue({ experienceType: data.workExperience.experienceType }),
          countValue(data.workExperience.entries)
        );

  const certificationCounts = data.certification.noCertification
    ? countValue({ noCertification: data.certification.noCertification })
    : combineCounts(
        countValue({ noCertification: data.certification.noCertification }),
        countValue(data.certification.entries)
      );

  const projectCounts = data.projects.noProjects
    ? countValue({ noProjects: data.projects.noProjects })
    : combineCounts(
        countValue({ noProjects: data.projects.noProjects }),
        countValue(data.projects.entries)
      );

  const reviewAgreeCounts = combineCounts(
    countValue({
      discover: data.reviewAgree.discover,
      comments: data.reviewAgree.comments,
    }),
    { total: 1, filled: data.reviewAgree.agree ? 1 : 0 }
  );

  return {
    basicInfo: countValue(data.basicInfo),
    education: countValue(data.education),
    workExperience: workExperienceCounts,
    skills: countValue(data.skills),
    projects: projectCounts,
    achievements: countValue(data.achievements),
    certification: certificationCounts,
    preference: countValue(data.preference),
    otherDetails: countValue(data.otherDetails),
    reviewAgree: reviewAgreeCounts,
  };
};

export const computeProfileSectionCompletion = (data: UserData) => {
  const counts = computeSectionCounts(data);

  return {
    basicInfo: toCompletion(counts.basicInfo),
    education: toCompletion(counts.education),
    workExperience: toCompletion(counts.workExperience),
    skills: toCompletion(counts.skills),
    projects: toCompletion(counts.projects),
    achievements: toCompletion(counts.achievements),
    certification: toCompletion(counts.certification),
    preference: toCompletion(counts.preference),
    otherDetails: toCompletion(counts.otherDetails),
    reviewAgree: toCompletion(counts.reviewAgree),
  };
};

export const computeProfileCompletion = (data: UserData) => {
  const counts = computeSectionCounts(data);
  const totals = combineCounts(...(Object.values(counts) as Counts[]));
  const percent =
    totals.total > 0
      ? Math.min(100, Math.round((totals.filled / totals.total) * 100))
      : 0;

  return {
    percent,
    isComplete: totals.total > 0 && totals.filled === totals.total,
  };
};
