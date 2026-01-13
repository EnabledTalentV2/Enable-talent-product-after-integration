"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertCircle, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import placeholder from "@/public/Placeholder.png";
import DashboardProfilePrompt from "@/components/DashboardProfilePrompt";
import { getNotifications, requestNote } from "@/lib/notifications";
import { computeProfileCompletion } from "@/lib/profileCompletion";
import { useUserDataStore } from "@/lib/userDataStore";
import { initialUserData } from "@/lib/userDataDefaults";

type ProfileSection = {
  id: string;
  label: string;
  count?: number;
  items?: string[];
};

const isLikelyImageSource = (value?: string) => {
  if (!value) return false;
  const trimmed = value.trim();
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:")
  );
};

const toTrimmed = (value?: string) => value?.trim() ?? "";
const fallbackText = "Data unavailable";

export default function HomePageDashboard() {
  const router = useRouter();
  const rawUserData = useUserDataStore((s) => s.userData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAboutExpanded, setIsAboutExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const notifications = getNotifications();

  // Merge with defaults to ensure all nested objects exist
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
      reviewAgree: {
        ...initialUserData.reviewAgree,
        ...rawUserData?.reviewAgree,
      },
    }),
    [rawUserData]
  );

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        const response = await fetch("/api/user/me", {
          credentials: "include",
        });

        if (response.status === 401) {
          router.replace("/login-talent");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load user data.");
        }

        await response.json();
        if (active) {
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError("Unable to load your dashboard right now.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      active = false;
    };
  }, [router]);

  const profileName =
    [userData.basicInfo.firstName, userData.basicInfo.lastName]
      .map(toTrimmed)
      .filter(Boolean)
      .join(" ") || fallbackText;
  const profileRole =
    toTrimmed(userData.workExperience.entries[0]?.role) ||
    toTrimmed(userData.skills.primaryList?.[0]) ||
    fallbackText;
  const profilePhoto = toTrimmed(userData.basicInfo.profilePhoto);
  const profileImage = isLikelyImageSource(profilePhoto)
    ? profilePhoto
    : placeholder;
  const unreadCount = notifications.filter((notice) => notice.unread).length;
  const { percent: profilePercent } = useMemo(
    () => computeProfileCompletion(userData),
    [userData]
  );

  const aboutParagraphs = useMemo(() => {
    const paragraphs: string[] = [];
    const status = toTrimmed(userData.basicInfo.currentStatus);
    if (status) {
      paragraphs.push(status);
    }

    const description = toTrimmed(
      userData.workExperience.entries[0]?.description
    );
    if (description) {
      const normalized = description
        .split("\n")
        .map((line) => line.replace(/^\s*[-*]\s*/, "").trim())
        .filter(Boolean)
        .join(" ");

      if (normalized) {
        paragraphs.push(normalized);
      }
    }

    if (paragraphs.length === 0) {
      const fallback = [
        userData.education.major,
        userData.education.institution,
      ]
        .map(toTrimmed)
        .filter(Boolean)
        .join(" - ");
      if (fallback) {
        paragraphs.push(fallback);
      }
    }

    return paragraphs;
  }, [userData]);

  const profileSections = useMemo<ProfileSection[]>(() => {
    const educationItems: string[] = [];
    const educationInstitution = toTrimmed(userData.education.institution);
    const educationMajor = toTrimmed(userData.education.major);
    const educationCourse = toTrimmed(userData.education.courseName);
    const educationDate = toTrimmed(userData.education.graduationDate);

    if (educationInstitution) {
      educationItems.push(`Institution: ${educationInstitution}`);
    }
    if (educationMajor) {
      educationItems.push(`Major: ${educationMajor}`);
    }
    if (educationCourse) {
      educationItems.push(`Course: ${educationCourse}`);
    }
    if (educationDate) {
      educationItems.push(`Graduation Date: ${educationDate}`);
    }

    const workItems = userData.workExperience.entries
      .map((entry) => {
        const role = toTrimmed(entry.role);
        const company = toTrimmed(entry.company);
        if (role && company) return `${role} at ${company}`;
        return role || company || null;
      })
      .filter((item): item is string => Boolean(item));

    const skillItems = (userData.skills.primaryList ?? [])
      .map(toTrimmed)
      .filter(Boolean);

    const projectItems = userData.projects.entries
      .map((entry) => toTrimmed(entry.projectName))
      .filter(Boolean);

    const achievementItems = userData.achievements.entries
      .map((entry) => toTrimmed(entry.title))
      .filter(Boolean);

    const certificationItems = userData.certification.noCertification
      ? []
      : userData.certification.entries
          .map((entry) => {
            const name = toTrimmed(entry.name);
            const org = toTrimmed(entry.organization);
            if (name && org) return `${name} - ${org}`;
            return name || org || null;
          })
          .filter((item): item is string => Boolean(item));

    const companySize = userData.preference.companySize
      .map(toTrimmed)
      .filter(Boolean);
    const jobType = userData.preference.jobType.map(toTrimmed).filter(Boolean);
    const jobSearch = userData.preference.jobSearch
      .map(toTrimmed)
      .filter(Boolean);
    const preferenceItems: string[] = [];

    if (companySize.length > 0) {
      preferenceItems.push(`Company Size: ${companySize.join(", ")}`);
    }
    if (jobType.length > 0) {
      preferenceItems.push(`Job Type: ${jobType.join(", ")}`);
    }
    if (jobSearch.length > 0) {
      preferenceItems.push(`Job Search: ${jobSearch.join(", ")}`);
    }

    const languageItems = userData.otherDetails.languages
      .map((language) => {
        const name = toTrimmed(language.language);
        if (!name) return null;
        const levels = [language.speaking, language.reading, language.writing]
          .map(toTrimmed)
          .filter(Boolean)
          .join(", ");
        return levels ? `${name}: ${levels}` : name;
      })
      .filter((item): item is string => Boolean(item));

    const otherItems = [...languageItems];
    const careerStage = toTrimmed(userData.otherDetails.careerStage);
    const desiredSalary = toTrimmed(userData.otherDetails.desiredSalary);
    if (careerStage) {
      otherItems.push(`Career Stage: ${careerStage}`);
    }
    if (desiredSalary) {
      otherItems.push(`Desired Salary: ${desiredSalary}`);
    }

    return [
      {
        id: "cultural-interest",
        label: "Cultural Interest",
        count: 0,
        items: [],
      },
      {
        id: "education",
        label: "Education",
        count: educationItems.length > 0 ? 1 : 0,
        items: educationItems,
      },
      {
        id: "work-experience",
        label: "Work Experience",
        count: userData.workExperience.entries.length,
        items: workItems,
      },
      {
        id: "skills",
        label: "Skills",
        count: skillItems.length,
        items: skillItems,
      },
      {
        id: "projects",
        label: "Projects",
        count: userData.projects.entries.length,
        items: projectItems,
      },
      {
        id: "achievements",
        label: "Achievements",
        count: achievementItems.length,
        items: achievementItems,
      },
      {
        id: "certifications",
        label: "Certifications",
        count: userData.certification.noCertification
          ? 0
          : userData.certification.entries.length,
        items: certificationItems,
      },
      {
        id: "preference",
        label: "Preference",
        count: companySize.length + jobType.length + jobSearch.length,
        items: preferenceItems,
      },
      {
        id: "other-details",
        label: "Other details",
        count: languageItems.length,
        items: otherItems,
      },
    ];
  }, [userData]);

  if (loading) {
    return (
      <div className="py-10 text-base text-slate-600">
        Loading your dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-base font-medium text-red-600">{error}</div>
    );
  }

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main id="main-content" aria-labelledby="dashboard-heading">
      <h1 id="dashboard-heading" className="sr-only">Talent Dashboard</h1>
      <section className="mx-auto max-w-360 space-y-6 py-10">
      <DashboardProfilePrompt percent={profilePercent} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div className="space-y-6">
          <div className="flex items-start justify-between rounded-[28px] bg-[#F7D16C] px-6 py-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-sm">
                <Image
                  src={profileImage}
                  alt={`${profileName} profile`}
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">
                  {profileName}
                </p>
                <p className="text-base font-medium text-slate-700">
                  {profileRole}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-slate-700 shadow-sm transition hover:bg-white"
              aria-label="Edit profile card"
            >
              <Pencil size={16} />
            </button>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">About</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:text-slate-700"
                  aria-label="Edit about section"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsAboutExpanded((prev) => !prev)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:text-slate-700"
                  aria-label={
                    isAboutExpanded
                      ? "Collapse about section"
                      : "Expand about section"
                  }
                  aria-expanded={isAboutExpanded}
                  aria-controls="about-section"
                >
                  {isAboutExpanded ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              </div>
            </div>
            {isAboutExpanded ? (
              <div
                id="about-section"
                className="mt-4 space-y-4 text-base leading-relaxed text-slate-600"
              >
                {aboutParagraphs.length > 0 ? (
                  aboutParagraphs.map((paragraph, index) => (
                    <p key={`${paragraph.slice(0, 24)}-${index}`}>
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-400">{fallbackText}.</p>
                )}
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            {profileSections.map((section) => {
              const isExpanded = Boolean(expandedSections[section.id]);
              const contentId = `section-${section.id}`;
              return (
                <div
                  key={section.id}
                  className="rounded-[28px] bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {section.label}
                      </p>
                      {typeof section.count === "number" ? (
                        <p className="text-sm text-slate-400">
                          {section.count} added
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:text-slate-700"
                      aria-label={`${isExpanded ? "Collapse" : "Expand"} ${
                        section.label
                      }`}
                      aria-expanded={isExpanded}
                      aria-controls={contentId}
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                  {isExpanded ? (
                    <div
                      id={contentId}
                      className="border-t border-slate-100 px-5 pb-4 pt-3 text-base text-slate-600"
                    >
                      {section.items && section.items.length > 0 ? (
                        <ul className="list-disc space-y-1 pl-4">
                          {section.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      ) : typeof section.count === "number" &&
                        section.count > 0 ? (
                        <p>{section.count} items available.</p>
                      ) : (
                        <p>{fallbackText}.</p>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-slate-900">
              Notifications
            </h2>
            <span className="text-base text-slate-500">
              ({unreadCount} Unread)
            </span>
          </div>

          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notice) => (
                <div
                  key={notice.id}
                  className="rounded-[28px] bg-white p-5 shadow-sm"
                >
                  <div className="space-y-1">
                    <p className="text-base font-medium text-slate-900">
                      {notice.message}
                    </p>
                    <p className="text-sm text-slate-400">{notice.time}</p>
                  </div>

                  {notice.type === "request" ? (
                    <div className="mt-4 space-y-3">
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          className="rounded-lg bg-[#C27803] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                        >
                          Decline
                        </button>
                      </div>
                      <div className="flex items-start gap-2 rounded-xl bg-[#FDE8E8] px-3 py-2 text-sm text-[#B42318]">
                        <AlertCircle className="mt-0.5 h-4 w-4" />
                        <span>{requestNote}</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-[28px] bg-white p-5 text-sm text-slate-500 shadow-sm">
                No notifications yet.
              </div>
            )}
          </div>
        </div>
      </div>
      </section>
    </main>
  );
}
