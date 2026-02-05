"use client";

import { useCallback, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useCandidateProfile } from "@/lib/hooks/useCandidateProfiles";
import { useCandidateInsight } from "@/lib/hooks/useCandidateInsight";
import ResumeChatPanel from "@/components/employer/ai/ResumeChatPanel";
import { CandidateDetailSkeleton } from "@/components/employer/candidates/CandidateLoadingSkeleton";
import SendInvitesModal from "@/components/employer/candidates/SendInvitesModal";
import SuccessModal from "@/components/employer/candidates/SuccessModal";
import Toast from "@/components/Toast";
import { useEmployerJobsStore } from "@/lib/employerJobsStore";
import { getApiErrorMessage } from "@/lib/api-client";
import { invitesAPI } from "@/lib/services/invitesAPI";
import {
  MapPin,
  Briefcase,
  CheckCircle,
  Mail,
  FileText,
  Linkedin,
  Github,
  Globe,
  Video,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface DetailSectionProps {
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

function DetailSection({
  title,
  badge,
  defaultOpen = false,
  children,
}: DetailSectionProps) {
  return (
    <details
      className="group rounded-2xl bg-white p-4 shadow-sm"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-2 rounded-lg -m-1 p-1">
        <span>{title}</span>
        <span className="flex items-center gap-2 text-xs text-slate-400">
          {badge && <span aria-hidden="true">{badge}</span>}
          <ChevronDown
            className="h-4 w-4 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
          <span className="sr-only">
            {badge ? `, ${badge}` : ""}, click to {defaultOpen ? "collapse" : "expand"}
          </span>
        </span>
      </summary>
      <div className="mt-3 text-sm text-slate-600">{children}</div>
    </details>
  );
}

const getInitials = (firstName: string, lastName: string) => {
  const first = firstName.trim();
  const last = lastName.trim();
  const initials = `${first.charAt(0)}${last.charAt(0)}`.trim();
  return initials || "C";
};

const formatDateRange = (start?: string, end?: string) => {
  const startLabel = start?.trim();
  const endLabel = end?.trim();
  if (!startLabel && !endLabel) return "";
  if (startLabel && endLabel) return `${startLabel} - ${endLabel}`;
  return startLabel ? `${startLabel} - Present` : endLabel || "";
};

export default function CandidateProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const pageParam = searchParams.get("page");
  const searchQuery = searchParams.get("search");
  const jobIdParam = searchParams.get("jobId");
  const backParams = new URLSearchParams();
  if (searchQuery) backParams.set("search", searchQuery);
  if (pageParam) backParams.set("page", pageParam);
  const backHref = backParams.toString()
    ? `/employer/dashboard/candidates?${backParams.toString()}`
    : "/employer/dashboard/candidates";
  const {
    fetchJobs,
    hasFetched: hasFetchedJobs,
    isLoading: isJobsLoading,
  } = useEmployerJobsStore();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSendingInvites, setIsSendingInvites] = useState(false);

  const { data: candidate, isLoading, error } = useCandidateProfile(slug || "");
  const candidateId = candidate?.id;
  const {
    data: insight,
    isLoading: isInsightLoading,
    error: insightError,
  } = useCandidateInsight(candidateId);

  const handleInviteClick = useCallback(() => {
    if (!hasFetchedJobs && !isJobsLoading) {
      fetchJobs();
    }
    setIsInviteModalOpen(true);
  }, [fetchJobs, hasFetchedJobs, isJobsLoading]);

  const handleSendInvites = useCallback(
    async (selectedJobIds: string[]) => {
      if (!candidateId) {
        setToastMessage("Unable to send invites. Candidate not available.");
        return;
      }
      if (selectedJobIds.length === 0 || isSendingInvites) {
        return;
      }

      setToastMessage(null);
      setInviteMessage(null);
      setIsSendingInvites(true);

      try {
        const results = await Promise.allSettled(
          selectedJobIds.map((jobId) =>
            invitesAPI.sendJobInvite(jobId, candidateId)
          )
        );

        const messages: string[] = [];
        const errors: string[] = [];

        results.forEach((result, index) => {
          const jobId = selectedJobIds[index];
          if (result.status === "fulfilled") {
            const detail = result.value?.detail || "Invite sent successfully";
            messages.push(`Job ${jobId}: ${detail}`);
          } else {
            errors.push(
              `Job ${jobId}: ${getApiErrorMessage(
                result.reason,
                "Failed to send invite"
              )}`
            );
          }
        });

        if (messages.length > 0) {
          setInviteMessage(messages.join("\n"));
          setIsSuccessModalOpen(true);
          setIsInviteModalOpen(false);
        }

        if (errors.length > 0) {
          setToastMessage(errors.join(" "));
        }
      } finally {
        setIsSendingInvites(false);
      }
    },
    [candidateId, isSendingInvites]
  );

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="sr-only">Loading candidate profile...</div>
        <CandidateDetailSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-2xl bg-red-50 p-6 shadow-sm">
          <p className="font-semibold text-red-800">Failed to load candidate profile</p>
          <p className="mt-2 text-sm text-red-600">
            {error instanceof Error ? error.message : "Please try again later"}
          </p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-2xl bg-slate-50 p-6 shadow-sm">
          <p className="text-slate-600">Candidate not found</p>
        </div>
      </div>
    );
  }

  const skills = candidate.resume_parsed?.skills ?? [];
  const skillsCount = skills.length;
  const experienceEntries = candidate.resume_parsed?.experience_entries ?? [];
  const educationEntries = candidate.resume_parsed?.education_entries ?? [];
  const certificationEntries =
    candidate.resume_parsed?.certification_entries ?? [];
  const experienceTextEntries =
    candidate.resume_parsed?.experience
      ?.split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean) ?? [];
  const educationTextEntries =
    candidate.resume_parsed?.education
      ?.split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean) ?? [];
  const certificationTextEntries =
    candidate.resume_parsed?.certifications
      ?.split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean) ?? [];
  const experienceCount =
    experienceEntries.length ||
    experienceTextEntries.length ||
    0;
  const educationCount =
    educationEntries.length ||
    educationTextEntries.length ||
    0;
  const certificationsCount =
    certificationEntries.length ||
    certificationTextEntries.length ||
    0;

  const links = [
    { label: "LinkedIn", href: candidate.linkedin, icon: Linkedin },
    { label: "GitHub", href: candidate.github, icon: Github },
    { label: "Portfolio", href: candidate.portfolio, icon: Globe },
    { label: "Video Pitch", href: candidate.video_pitch, icon: Video },
  ].filter(
    (link): link is { label: string; href: string; icon: typeof Linkedin } =>
      Boolean(link.href)
  );

  const preferences = [
    { label: "Job type", value: candidate.job_type },
    { label: "Work mode", value: candidate.work_arrangement },
    { label: "Availability", value: candidate.availability },
    {
      label: "Expected salary",
      value:
        candidate.salary_min || candidate.salary_max
          ? `${candidate.salary_min ? `$${candidate.salary_min.toLocaleString()}` : ""}${candidate.salary_min && candidate.salary_max ? " - " : ""}${candidate.salary_max ? `$${candidate.salary_max.toLocaleString()}` : ""}`
          : "",
    },
    {
      label: "Visa sponsorship",
      value:
        candidate.visa_required === undefined
          ? ""
          : candidate.visa_required
          ? "Required"
          : "Not required",
    },
    {
      label: "Relocation",
      value:
        candidate.willing_to_relocate === undefined
          ? ""
          : candidate.willing_to_relocate
          ? "Open to relocate"
          : "Not willing",
    },
  ].filter((item) => item.value);

  const summary = candidate.bio || candidate.resume_parsed?.summary;
  const insightText = insight?.employer_insight?.trim();

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Back Link */}
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#C27803] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Candidates
      </Link>

      <div className="space-y-4">
        {/* Header Card */}
        <div className="rounded-[28px] bg-[#FFD58C] p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-white/70">
                <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-slate-700">
                  {getInitials(candidate.first_name, candidate.last_name)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {candidate.first_name} {candidate.last_name}
                  </h1>
                  {candidate.is_verified && (
                    <CheckCircle className="h-6 w-6 text-emerald-700" />
                  )}
                </div>
                <p className="text-sm text-slate-700">
                  {candidate.job_type && candidate.work_arrangement
                    ? `${candidate.job_type} • ${candidate.work_arrangement}`
                    : candidate.job_type || candidate.work_arrangement || "Open to opportunities"}
                </p>
              </div>
            </div>

            {candidate.availability && (
              <span
                className={`self-start rounded-full px-3 py-1 text-sm font-medium ${
                  candidate.availability === "Available"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {candidate.availability}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-700">
            {candidate.email && (
              <a
                href={`mailto:${candidate.email}`}
                className="flex items-center gap-2 hover:text-slate-900 transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>{candidate.email}</span>
              </a>
            )}
            {candidate.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{candidate.location}</span>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {candidate.resume_url && (
              <a
                href={candidate.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#C27831] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#A66628]"
              >
                <FileText className="h-4 w-4" />
                View Resume
              </a>
            )}
            <button
              onClick={handleInviteClick}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#C27831] bg-white px-4 py-2 text-sm font-semibold text-[#A66628] transition-colors hover:bg-white/80"
            >
              Send Invites for Jobs
            </button>
          </div>
        </div>

        {/* About Section */}
        <DetailSection title="About" defaultOpen>
          {summary ? (
            <p className="leading-relaxed text-slate-600">{summary}</p>
          ) : (
            <p className="text-slate-500">No bio or summary provided yet.</p>
          )}
        </DetailSection>

        {/* Work Preferences */}
        <DetailSection
          title="Work preferences"
          badge={preferences.length ? `${preferences.length} added` : "Not set"}
          defaultOpen
        >
          {preferences.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {preferences.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No preferences shared yet.</p>
          )}
        </DetailSection>

        {/* Skills */}
        <DetailSection
          title="Skills"
          badge={skillsCount ? `${skillsCount} added` : "Not set"}
          defaultOpen
        >
          {skillsCount ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No skills listed yet.</p>
          )}
        </DetailSection>

        {/* Work Experience */}
        <DetailSection
          title="Work experience"
          badge={experienceCount ? `${experienceCount} added` : "Not set"}
          defaultOpen
        >
          {experienceEntries.length > 0 ? (
            <div className="space-y-4">
              {experienceEntries.map((entry, index) => {
                const title =
                  entry.role || entry.company || "Experience entry";
                const subtitle =
                  [entry.company, entry.location].filter(Boolean).join(" • ");
                const timeline = formatDateRange(
                  entry.start_date,
                  entry.end_date
                );
                const description = entry.description || entry.raw_text;
                return (
                  <div
                    key={`${entry.role ?? "experience"}-${index}`}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {title}
                        </h3>
                        {subtitle ? (
                          <p className="text-xs text-slate-500">{subtitle}</p>
                        ) : null}
                      </div>
                      {timeline ? (
                        <span className="text-xs text-slate-500">
                          {timeline}
                        </span>
                      ) : null}
                    </div>
                    {description ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                        {description}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : experienceTextEntries.length > 0 ? (
            <div className="space-y-3">
              {experienceTextEntries.map((entry, index) => (
                <div
                  key={`experience-line-${index}`}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="text-sm text-slate-600">{entry}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No experience details provided.</p>
          )}
        </DetailSection>

        {/* Education */}
        <DetailSection
          title="Education"
          badge={educationCount ? `${educationCount} added` : "Not set"}
          defaultOpen
        >
          {educationEntries.length > 0 ? (
            <div className="space-y-4">
              {educationEntries.map((entry, index) => {
                const degreeLine = [entry.degree, entry.field_of_study]
                  .filter(Boolean)
                  .join(" • ");
                const institution = entry.institution;
                const timeline = formatDateRange(
                  entry.start_date,
                  entry.end_date
                );
                const description = entry.description || entry.raw_text;
                return (
                  <div
                    key={`${entry.degree ?? "education"}-${index}`}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {degreeLine || "Education entry"}
                        </h3>
                        {institution ? (
                          <p className="text-xs text-slate-500">{institution}</p>
                        ) : null}
                      </div>
                      {timeline ? (
                        <span className="text-xs text-slate-500">
                          {timeline}
                        </span>
                      ) : null}
                    </div>
                    {entry.grade ? (
                      <p className="mt-2 text-xs font-medium text-slate-500">
                        Grade: {entry.grade}
                      </p>
                    ) : null}
                    {description ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                        {description}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : educationTextEntries.length > 0 ? (
            <div className="space-y-3">
              {educationTextEntries.map((entry, index) => (
                <div
                  key={`education-line-${index}`}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="text-sm text-slate-600">{entry}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No education details provided.</p>
          )}
        </DetailSection>

        {/* Certifications */}
        <DetailSection
          title="Certifications"
          badge={certificationsCount ? `${certificationsCount} added` : "Not set"}
        >
          {certificationEntries.length > 0 ? (
            <div className="space-y-3">
              {certificationEntries.map((entry, index) => {
                const name = entry.name || entry.raw_text || "Certification";
                const details = [entry.issuer, entry.issued_date]
                  .filter(Boolean)
                  .join(" • ");
                return (
                  <div
                    key={`${entry.name ?? "certification"}-${index}`}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <h3 className="text-sm font-semibold text-slate-900">
                      {name}
                    </h3>
                    {details ? (
                      <p className="text-xs text-slate-500">{details}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : certificationTextEntries.length > 0 ? (
            <div className="space-y-3">
              {certificationTextEntries.map((entry, index) => (
                <div
                  key={`certification-line-${index}`}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="text-sm text-slate-600">{entry}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No certifications provided.</p>
          )}
        </DetailSection>

        {/* Links and Media */}
        <DetailSection
          title="Links and media"
          badge={links.length ? `${links.length} added` : "Not set"}
        >
          {links.length ? (
            <div className="flex flex-wrap gap-3">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 transition-colors hover:border-[#C27803] hover:text-[#C27803]"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </a>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500">No links shared yet.</p>
          )}
        </DetailSection>

        <DetailSection title="Employer insight" defaultOpen>
          {isInsightLoading ? (
            <p className="text-slate-500" role="status" aria-live="polite">
              Loading insight...
            </p>
          ) : insightError ? (
            <p className="text-slate-500" role="alert">
              Unable to load employer insight.
            </p>
          ) : insightText ? (
            <p className="whitespace-pre-wrap leading-relaxed text-slate-600">
              {insightText}
            </p>
          ) : (
            <p className="text-slate-500">No insight available yet.</p>
          )}
        </DetailSection>

        {/* AI Resume Chat */}
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden" style={{ height: "500px" }}>
          <ResumeChatPanel
            resumeSlug={slug || ""}
            candidateName={`${candidate.first_name} ${candidate.last_name}`}
          />
        </div>
      </div>

      <SendInvitesModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSendInvites={handleSendInvites}
        restrictToJobId={jobIdParam || undefined}
        isSending={isSendingInvites}
      />
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={inviteMessage ?? undefined}
      />
      {toastMessage && (
        <Toast
          tone="error"
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
