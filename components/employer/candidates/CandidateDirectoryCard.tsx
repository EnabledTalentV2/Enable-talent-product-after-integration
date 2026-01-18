import { Briefcase, CheckCircle, MapPin } from "lucide-react";
import type { CandidateProfile } from "@/lib/types/candidateProfile";

interface CandidateDirectoryCardProps {
  candidate: CandidateProfile;
  isSelected: boolean;
  profileScore: number;
  onClick: () => void;
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

export default function CandidateDirectoryCard({
  candidate,
  isSelected,
  profileScore,
  onClick,
}: CandidateDirectoryCardProps) {
  const availability = candidate.availability;
  const availabilityClass =
    availability === "Available"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-slate-100 text-slate-600";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`w-full text-left rounded-2xl border p-4 transition-all ${
        isSelected
          ? "border-[#D9772C] bg-[#FFF7EE] shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-200">
            <div
              className="flex h-full w-full items-center justify-center bg-slate-300 text-sm font-semibold text-slate-600"
              aria-label={`${candidate.first_name} ${candidate.last_name} avatar`}
            >
              {getInitials(candidate.first_name, candidate.last_name)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                {candidate.first_name} {candidate.last_name}
              </h3>
              {candidate.is_verified && (
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              )}
            </div>
            <p className="text-xs text-slate-500">{formatHeadline(candidate)}</p>
          </div>
        </div>
        {availability && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${availabilityClass}`}>
            {availability}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="space-y-2 text-xs text-slate-500">
          {candidate.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>{candidate.location}</span>
            </div>
          )}
          {candidate.job_type && (
            <div className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
              <span>{candidate.job_type}</span>
            </div>
          )}
        </div>

        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full bg-[#FFF1D6] text-slate-900">
          <span className="text-sm font-semibold">{profileScore}%</span>
          <span className="text-[10px] text-slate-500">Profile</span>
        </div>
      </div>
    </button>
  );
}
