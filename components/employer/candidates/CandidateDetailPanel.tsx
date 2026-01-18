import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  FileText,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Video,
  Github,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { CandidateProfile } from "@/lib/types/candidateProfile";

interface CandidateDetailPanelProps {
  candidate: CandidateProfile;
  profileScore: number;
  profileHref?: string;
}

const getInitials = (firstName: string, lastName: string) => {
  const first = firstName.trim();
  const last = lastName.trim();
  const initials = `${first.charAt(0)}${last.charAt(0)}`.trim();
  return initials || "C";
};

const formatHeadline = (candidate: CandidateProfile) => {
  const parts = [candidate.job_type, candidate.work_arrangement].filter(Boolean);
  return parts.length > 0 ? parts.join(" • ") : "Open to opportunities";
};

const formatSalaryRange = (
  salaryMin?: number,
  salaryMax?: number
): string => {
  if (!salaryMin && !salaryMax) return "";
  const min = salaryMin ? `$${salaryMin.toLocaleString()}` : "";
  const max = salaryMax ? `$${salaryMax.toLocaleString()}` : "";
  if (min && max) return `${min} - ${max}`;
  return min || max;
};

const formatDate = (date?: string) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

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
          <ChevronDown className="h-4 w-4" />
        </span>
      </summary>
      <div className="mt-3 text-sm text-slate-600">{children}</div>
    </details>
  );
}

export default function CandidateDetailPanel({
  candidate,
  profileScore,
  profileHref,
}: CandidateDetailPanelProps) {
  const salaryRange = formatSalaryRange(
    candidate.salary_min,
    candidate.salary_max
  );
  const skills = candidate.resume_parsed?.skills ?? [];
  const skillsCount = skills.length;
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
    { label: "Expected salary", value: salaryRange },
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
  const joinedDate = formatDate(candidate.created_at);
  const otherDetailsCount =
    Number(Boolean(candidate.phone)) + Number(Boolean(joinedDate));

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] bg-[#FFD58C] p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 overflow-hidden rounded-full bg-white/70">
              <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-slate-700">
                {getInitials(candidate.first_name, candidate.last_name)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  {candidate.first_name} {candidate.last_name}
                </h2>
                {candidate.is_verified && (
                  <CheckCircle className="h-5 w-5 text-emerald-700" />
                )}
              </div>
              <p className="text-sm text-slate-700">
                {formatHeadline(candidate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-white text-slate-900">
              <span className="text-sm font-bold">{profileScore}%</span>
              <span className="text-[10px] text-slate-500">Profile</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-700">
          {candidate.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{candidate.email}</span>
            </div>
          )}
          {candidate.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{candidate.location}</span>
            </div>
          )}
          {candidate.availability && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>{candidate.availability}</span>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={
              profileHref ||
              `/employer/dashboard/candidates/profile/${candidate.slug}`
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-[#C27831] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#A66628]"
          >
            View full profile
            <ArrowRight className="h-4 w-4" />
          </Link>
          {candidate.resume_url && (
            <a
              href={candidate.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-white"
            >
              <FileText className="h-4 w-4" />
              Resume
            </a>
          )}
        </div>
      </div>

      <DetailSection title="About" defaultOpen>
        {summary ? (
          <p className="leading-relaxed text-slate-600">{summary}</p>
        ) : (
          <p className="text-slate-500">No bio or summary provided yet.</p>
        )}
      </DetailSection>

      <DetailSection
        title="Work preferences"
        badge={preferences.length ? `${preferences.length} added` : "Not set"}
      >
        {preferences.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
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

      <DetailSection
        title="Skills"
        badge={skillsCount ? `${skillsCount} added` : "Not set"}
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

      <DetailSection
        title="Work experience"
        badge={candidate.resume_parsed?.experience ? "1 added" : "Not set"}
      >
        {candidate.resume_parsed?.experience ? (
          <p className="whitespace-pre-wrap text-slate-600">
            {candidate.resume_parsed.experience}
          </p>
        ) : (
          <p className="text-slate-500">No experience details provided.</p>
        )}
      </DetailSection>

      <DetailSection
        title="Education"
        badge={candidate.resume_parsed?.education ? "1 added" : "Not set"}
      >
        {candidate.resume_parsed?.education ? (
          <p className="whitespace-pre-wrap text-slate-600">
            {candidate.resume_parsed.education}
          </p>
        ) : (
          <p className="text-slate-500">No education details provided.</p>
        )}
      </DetailSection>

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

      <DetailSection
        title="Other details"
        badge={otherDetailsCount ? `${otherDetailsCount} added` : "Not set"}
      >
        {(candidate.phone || joinedDate) ? (
          <div className="space-y-2">
            {candidate.phone && (
              <p className="text-sm text-slate-600">
                Phone: <span className="font-semibold">{candidate.phone}</span>
              </p>
            )}
            {joinedDate && (
              <p className="text-sm text-slate-600">
                Joined:{" "}
                <span className="font-semibold">{joinedDate}</span>
              </p>
            )}
          </div>
        ) : (
          <p className="text-slate-500">No additional details provided.</p>
        )}
      </DetailSection>
    </div>
  );
}
