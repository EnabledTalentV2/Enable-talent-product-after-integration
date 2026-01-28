"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Calendar,
  ExternalLink,
  Globe,
  GraduationCap,
  Linkedin,
  MapPin,
  Award,
  FolderOpen,
} from "lucide-react";
import placeholder from "@/public/Placeholder.png";
import DashboardProfilePrompt from "@/components/DashboardProfilePrompt";
import { CandidateHomeSkeleton } from "@/components/CandidateDashboardSkeletons";
import { computeDashboardProfileCompletion } from "@/lib/profileCompletion";
import { useUserDataStore } from "@/lib/userDataStore";
import { initialUserData } from "@/lib/userDataDefaults";

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
const fallbackText = "Not specified";

// WCAG AA compliant colors with 4.5:1+ contrast ratio
const getSkillLevelColor = (level?: string) => {
  const normalized = level?.toLowerCase() ?? "";
  if (normalized === "advanced") return "bg-green-50 text-green-800";
  if (normalized === "intermediate") return "bg-amber-50 text-amber-800";
  return "bg-slate-100 text-slate-800";
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export default function HomePageDashboard() {
  const router = useRouter();
  const rawUserData = useUserDataStore((s) => s.userData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        ...(initialUserData.accessibilityNeeds ?? {
          categories: [],
          accommodationNeed: "",
          disclosurePreference: "",
          accommodations: [],
        }),
        ...rawUserData?.accessibilityNeeds,
      },
      reviewAgree: {
        ...initialUserData.reviewAgree,
        ...rawUserData?.reviewAgree,
      },
    }),
    [rawUserData],
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
      } catch {
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
    toTrimmed(userData.skills.primaryList?.[0]?.name) ||
    "Professional";

  const profilePhoto = toTrimmed(userData.basicInfo.profilePhoto);
  const profileImage = isLikelyImageSource(profilePhoto)
    ? profilePhoto
    : placeholder;

  const location = toTrimmed(userData.basicInfo.location);
  const linkedinUrl = toTrimmed(userData.basicInfo.linkedinUrl);
  const portfolioUrl = toTrimmed(userData.basicInfo.portfolioUrl);

  const { percent: profilePercent } = useMemo(
    () => computeDashboardProfileCompletion(userData),
    [userData],
  );

  const aboutParagraphs = useMemo(() => {
    const paragraphs: string[] = [];
    const status = toTrimmed(userData.basicInfo.currentStatus);

    // Only use currentStatus as the primary source
    if (status) {
      paragraphs.push(status);
      return paragraphs;
    }

    // Fallback: work experience description
    const description = toTrimmed(
      userData.workExperience.entries[0]?.description,
    );
    if (description) {
      const normalized = description
        .split("\n")
        .map((line) => line.replace(/^\s*[-*]\s*/, "").trim())
        .filter(Boolean)
        .join(" ");
      if (normalized) {
        paragraphs.push(normalized);
        return paragraphs;
      }
    }

    // Fallback: education info
    const fallback = [userData.education.major, userData.education.institution]
      .map(toTrimmed)
      .filter(Boolean)
      .join(" - ");
    if (fallback) paragraphs.push(fallback);

    return paragraphs;
  }, [userData]);

  const skills = userData.skills.primaryList ?? [];
  const workEntries = userData.workExperience.entries ?? [];
  const projectEntries = userData.projects.entries ?? [];
  const achievementEntries = userData.achievements.entries ?? [];
  const certificationEntries = userData.certification.noCertification
    ? []
    : userData.certification.entries ?? [];

  const languages = userData.otherDetails.languages ?? [];
  const careerStage = toTrimmed(userData.otherDetails.careerStage);
  const desiredSalary = toTrimmed(userData.otherDetails.desiredSalary);

  if (loading) {
    return <CandidateHomeSkeleton />;
  }

  if (error) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="py-10 text-base font-medium text-red-700"
      >
        {error}
      </div>
    );
  }

  return (
    <main id="main-content" aria-labelledby="dashboard-heading">
      <h1 id="dashboard-heading" className="sr-only">
        Talent Dashboard - Portfolio
      </h1>
      <section
        aria-label="Profile Portfolio"
        className="mx-auto max-w-360 space-y-6 py-10"
      >
        <DashboardProfilePrompt percent={profilePercent} />

        {/* Profile Summary Card */}
        <article
          aria-labelledby="profile-name"
          className="rounded-[28px] bg-[#F7D16C] px-6 py-5 shadow-sm"
        >
          <div className="flex items-center gap-4">
            {/* Profile Image */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-sm">
              <Image
                src={profileImage}
                alt=""
                aria-hidden={profileName !== fallbackText ? "false" : "true"}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2
                id="profile-name"
                className="text-2xl font-bold text-slate-900"
              >
                {profileName}
              </h2>
              <p className="mt-1 text-base font-medium text-slate-800">
                {profileRole}
              </p>
              {location && (
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-700">
                  <MapPin size={14} aria-hidden="true" />
                  <span className="sr-only">Location: </span>
                  {location}
                </p>
              )}
              {/* Social Links */}
              {(linkedinUrl || portfolioUrl) && (
                <nav aria-label="Social links" className="mt-3 flex items-center gap-3">
                  {linkedinUrl && (
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm font-medium text-slate-800 underline decoration-transparent underline-offset-2 transition-colors hover:text-slate-900 hover:decoration-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-2"
                    >
                      <Linkedin size={16} aria-hidden="true" />
                      LinkedIn
                      <span className="sr-only"> (opens in new tab)</span>
                    </a>
                  )}
                  {portfolioUrl && (
                    <a
                      href={portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm font-medium text-slate-800 underline decoration-transparent underline-offset-2 transition-colors hover:text-slate-900 hover:decoration-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-2"
                    >
                      <Globe size={16} aria-hidden="true" />
                      Website
                      <span className="sr-only"> (opens in new tab)</span>
                    </a>
                  )}
                </nav>
              )}
            </div>
          </div>
        </article>

        <div className="space-y-6">
          {/* About Section */}
          {aboutParagraphs.length > 0 && (
            <section
              aria-labelledby="about-heading"
              className="rounded-[28px] border-l-4 border-[#C27803] bg-white p-6 shadow-sm"
            >
              <h2
                id="about-heading"
                className="text-lg font-semibold text-slate-900"
              >
                About
              </h2>
              <div className="mt-3 space-y-3 text-base leading-relaxed text-slate-700">
                {aboutParagraphs.map((paragraph, index) => (
                  <p key={`about-${index}`}>{paragraph}</p>
                ))}
              </div>
            </section>
          )}

          {/* Skills Section */}
          {skills.length > 0 && (
            <section
              aria-labelledby="skills-heading"
              className="rounded-[28px] bg-white p-6 shadow-sm"
            >
              <h2
                id="skills-heading"
                className="flex items-center gap-2 text-lg font-semibold text-slate-900"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#C94A2A] to-[#F1B45C] text-white"
                  aria-hidden="true"
                >
                  <Award size={16} />
                </span>
                Skills
              </h2>
              <ul
                aria-label="Skills list"
                className="mt-4 flex flex-wrap gap-2"
              >
                {skills.map((skill, index) => (
                  <li
                    key={`skill-${index}`}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium ${getSkillLevelColor(skill.level)}`}
                  >
                    {skill.name}
                    {skill.level && (
                      <span className="ml-1 text-xs">
                        <span className="sr-only"> - proficiency level: </span>
                        ({skill.level})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Work Experience Timeline */}
          {workEntries.length > 0 && (
            <section
              aria-labelledby="work-heading"
              className="rounded-[28px] bg-white p-6 shadow-sm"
            >
              <h2
                id="work-heading"
                className="flex items-center gap-2 text-lg font-semibold text-slate-900"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#C94A2A] to-[#F1B45C] text-white"
                  aria-hidden="true"
                >
                  <Briefcase size={16} />
                </span>
                Work Experience
              </h2>
              <ol
                aria-label="Work experience timeline"
                className="relative mt-6 ml-4 border-l-2 border-orange-200 pl-6"
              >
                {workEntries.map((entry, index) => (
                  <li
                    key={`work-${index}`}
                    className="relative pb-6 last:pb-0"
                  >
                    {/* Timeline dot - decorative */}
                    <div
                      className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-[#C27803] bg-white"
                      aria-hidden="true"
                    />
                    <article>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {toTrimmed(entry.role) || "Role"}
                          </h3>
                          <p className="text-sm text-slate-700">
                            {toTrimmed(entry.company) || "Company"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {entry.current && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                              Current
                            </span>
                          )}
                          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                            <Calendar size={12} aria-hidden="true" />
                            <span className="sr-only">Duration: </span>
                            {formatDate(entry.from)}
                            {" - "}
                            {entry.current ? "Present" : formatDate(entry.to)}
                          </span>
                        </div>
                      </div>
                      {entry.description && (
                        <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                          {entry.description}
                        </p>
                      )}
                    </article>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Projects Grid */}
          {projectEntries.length > 0 && (
            <section
              aria-labelledby="projects-heading"
              className="rounded-[28px] bg-white p-6 shadow-sm"
            >
              <h2
                id="projects-heading"
                className="flex items-center gap-2 text-lg font-semibold text-slate-900"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#C94A2A] to-[#F1B45C] text-white"
                  aria-hidden="true"
                >
                  <FolderOpen size={16} />
                </span>
                Projects
              </h2>
              <ul
                aria-label="Projects list"
                className="mt-4 grid gap-4 sm:grid-cols-2"
              >
                {projectEntries.map((project, index) => (
                  <li key={`project-${index}`}>
                    <article className="h-full rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-orange-300 hover:shadow-sm focus-within:ring-2 focus-within:ring-[#C27803]">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-slate-900">
                          {toTrimmed(project.projectName) || "Project"}
                        </h3>
                        {project.current && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                            Ongoing
                          </span>
                        )}
                      </div>
                      {(project.from || project.to) && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                          <Calendar size={12} aria-hidden="true" />
                          <span className="sr-only">Duration: </span>
                          {formatDate(project.from)}
                          {project.to && ` - ${formatDate(project.to)}`}
                        </p>
                      )}
                      {project.projectDescription && (
                        <p className="mt-2 text-sm text-slate-700 line-clamp-2">
                          {project.projectDescription}
                        </p>
                      )}
                    </article>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Education */}
          {(userData.education.institution || userData.education.major) && (
            <section
              aria-labelledby="education-heading"
              className="rounded-[28px] bg-white p-6 shadow-sm"
            >
              <h2
                id="education-heading"
                className="flex items-center gap-2 text-lg font-semibold text-slate-900"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#C94A2A] to-[#F1B45C] text-white"
                  aria-hidden="true"
                >
                  <GraduationCap size={16} />
                </span>
                Education
              </h2>
              <article className="mt-4 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  {toTrimmed(userData.education.institution) || "Institution"}
                </h3>
                <p className="mt-1 text-slate-700">
                  {[
                    toTrimmed(userData.education.courseName),
                    toTrimmed(userData.education.major),
                  ]
                    .filter(Boolean)
                    .join(" in ") || "Degree"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {userData.education.graduationDate && (
                    <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      <Calendar size={12} aria-hidden="true" />
                      Graduated: {formatDate(userData.education.graduationDate)}
                    </span>
                  )}
                  {userData.education.grade && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      Grade: {userData.education.grade}
                    </span>
                  )}
                </div>
              </article>
            </section>
          )}

          {/* Credentials (Achievements + Certifications) */}
          {(achievementEntries.length > 0 ||
            certificationEntries.length > 0) && (
            <section
              aria-labelledby="credentials-heading"
              className="rounded-[28px] bg-white p-6 shadow-sm"
            >
              <h2
                id="credentials-heading"
                className="flex items-center gap-2 text-lg font-semibold text-slate-900"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#C94A2A] to-[#F1B45C] text-white"
                  aria-hidden="true"
                >
                  <Award size={16} />
                </span>
                Credentials
              </h2>

              {/* Achievements */}
              {achievementEntries.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium uppercase tracking-wide text-slate-600">
                    Achievements
                  </h3>
                  <ul aria-label="Achievements list" className="mt-2 flex flex-wrap gap-2">
                    {achievementEntries.map((achievement, index) => (
                      <li
                        key={`achievement-${index}`}
                        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2"
                      >
                        <p className="font-medium text-slate-900">
                          {toTrimmed(achievement.title)}
                        </p>
                        {achievement.issueDate && (
                          <p className="text-xs text-slate-600">
                            <span className="sr-only">Received: </span>
                            {formatDate(achievement.issueDate)}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Certifications */}
              {certificationEntries.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium uppercase tracking-wide text-slate-600">
                    Certifications
                  </h3>
                  <ul aria-label="Certifications list" className="mt-2 flex flex-wrap gap-2">
                    {certificationEntries.map((cert, index) => (
                      <li
                        key={`cert-${index}`}
                        className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {toTrimmed(cert.name)}
                          </p>
                          <p className="text-xs text-slate-600">
                            <span className="sr-only">Issued by: </span>
                            {toTrimmed(cert.organization)}
                          </p>
                        </div>
                        {cert.credentialIdUrl && (
                          <a
                            href={cert.credentialIdUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded p-1 text-green-700 transition-colors hover:text-green-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-2"
                            aria-label={`View ${toTrimmed(cert.name)} credential (opens in new tab)`}
                          >
                            <ExternalLink size={14} aria-hidden="true" />
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* Other Details */}
          {(languages.length > 0 || careerStage || desiredSalary) && (
            <section
              aria-labelledby="additional-heading"
              className="rounded-[28px] bg-white p-6 shadow-sm"
            >
              <h2
                id="additional-heading"
                className="text-lg font-semibold text-slate-900"
              >
                Additional Info
              </h2>
              <div className="mt-4 space-y-4">
                {/* Languages */}
                {languages.length > 0 &&
                  languages.some((l) => toTrimmed(l.language)) && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-600">
                        Languages
                      </h3>
                      <ul aria-label="Languages" className="mt-2 flex flex-wrap gap-2">
                        {languages
                          .filter((l) => toTrimmed(l.language))
                          .map((lang, index) => (
                            <li
                              key={`lang-${index}`}
                              className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-800"
                            >
                              {lang.language}
                              {(lang.speaking ||
                                lang.reading ||
                                lang.writing) && (
                                <span className="ml-1 text-xs text-slate-600">
                                  <span className="sr-only">
                                    {" "}
                                    - proficiency:{" "}
                                  </span>
                                  (
                                  {[lang.speaking, lang.reading, lang.writing]
                                    .filter(Boolean)
                                    .join("/")}
                                  )
                                </span>
                              )}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                {/* Career & Salary */}
                {(careerStage || desiredSalary) && (
                  <dl className="flex flex-wrap gap-3">
                    {careerStage && (
                      <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-800">
                        <dt className="inline font-medium">Career Stage:</dt>{" "}
                        <dd className="inline">{careerStage}</dd>
                      </div>
                    )}
                    {desiredSalary && (
                      <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-800">
                        <dt className="inline font-medium">Expected Salary:</dt>{" "}
                        <dd className="inline">{desiredSalary}</dd>
                      </div>
                    )}
                  </dl>
                )}
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
