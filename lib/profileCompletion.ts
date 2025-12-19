import type { UserData } from "@/components/signup/types";

export const computeProfileCompletion = (data: UserData) => {
  const countValue = (value: unknown): { total: number; filled: number } => {
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
      return { total: 1, filled: 1 };
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return { total: 1, filled: 0 };
      }

      return value.reduce(
        (acc, item) => {
          const next = countValue(item);
          return { total: acc.total + next.total, filled: acc.filled + next.filled };
        },
        { total: 0, filled: 0 }
      );
    }

    if (typeof value === "object") {
      return Object.values(value as Record<string, unknown>).reduce(
        (acc, item) => {
          const next = countValue(item);
          return { total: acc.total + next.total, filled: acc.filled + next.filled };
        },
        { total: 0, filled: 0 }
      );
    }

    return { total: 1, filled: 0 };
  };

  const combineCounts = (...counts: Array<{ total: number; filled: number }>) =>
    counts.reduce(
      (acc, next) => ({ total: acc.total + next.total, filled: acc.filled + next.filled }),
      { total: 0, filled: 0 }
    );

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

  const reviewAgreeCounts = combineCounts(
    countValue({ discover: data.reviewAgree.discover, comments: data.reviewAgree.comments }),
    { total: 1, filled: data.reviewAgree.agree ? 1 : 0 }
  );

  const totals = combineCounts(
    countValue(data.basicInfo),
    countValue(data.education),
    workExperienceCounts,
    countValue(data.skills),
    countValue(data.projects),
    countValue(data.achievements),
    certificationCounts,
    countValue(data.preference),
    countValue(data.otherDetails),
    reviewAgreeCounts
  );

  const percent = totals.total > 0 ? Math.min(100, Math.round((totals.filled / totals.total) * 100)) : 0;

  return { percent, isComplete: totals.total > 0 && totals.filled === totals.total };
};
