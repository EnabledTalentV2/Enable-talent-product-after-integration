"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useCandidateProfile } from "@/lib/hooks/useCandidateProfiles";
import ResumeChatPanel from "@/components/employer/ai/ResumeChatPanel";
import { CandidateDetailSkeleton } from "@/components/employer/candidates/CandidateLoadingSkeleton";
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
      <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <span className="flex items-center gap-2 text-xs text-slate-400">
          {badge && <span>{badge}</span>}
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
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

export default function CandidateProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const jobId = searchParams.get("jobId") || "";

  const { data: candidate, isLoading, error } = useCandidateProfile(slug || "");

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
  const experienceCount = candidate.resume_parsed?.experience?.split("\n").filter(Boolean).length ?? 0;
  const educationCount = candidate.resume_parsed?.education?.split("\n").filter(Boolean).length ?? 0;
  const certificationsCount = candidate.resume_parsed?.certifications?.split("\n").filter(Boolean).length ?? 0;

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

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Back Link */}
      <Link
        href="/employer/dashboard/candidates"
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
            {jobId && (
              <button
                onClick={() => {
                  console.log("Send invite to candidate:", slug, "for job:", jobId);
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#C27831] bg-white px-4 py-2 text-sm font-semibold text-[#A66628] transition-colors hover:bg-white/80"
              >
                Send Invite
              </button>
            )}
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
          {candidate.resume_parsed?.experience ? (
            <p className="whitespace-pre-wrap text-slate-600">
              {candidate.resume_parsed.experience}
            </p>
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
          {candidate.resume_parsed?.education ? (
            <p className="whitespace-pre-wrap text-slate-600">
              {candidate.resume_parsed.education}
            </p>
          ) : (
            <p className="text-slate-500">No education details provided.</p>
          )}
        </DetailSection>

        {/* Certifications */}
        <DetailSection
          title="Certifications"
          badge={certificationsCount ? `${certificationsCount} added` : "Not set"}
        >
          {candidate.resume_parsed?.certifications ? (
            <p className="whitespace-pre-wrap text-slate-600">
              {candidate.resume_parsed.certifications}
            </p>
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

        {/* AI Resume Chat */}
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden" style={{ height: "500px" }}>
          <ResumeChatPanel
            resumeSlug={slug || ""}
            candidateName={`${candidate.first_name} ${candidate.last_name}`}
          />
        </div>
      </div>
    </div>
  );
}
