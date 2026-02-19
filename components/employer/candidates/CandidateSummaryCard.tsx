import type { ReactNode } from "react";

interface CandidateBadge {
  label: string;
  className: string;
}

interface CandidateMetaItem {
  icon: ReactNode;
  text: string;
}

interface CandidateScore {
  value: number;
  label: string;
}

interface CandidateSummaryCardProps {
  name: string;
  subtitle?: string;
  avatarUrl?: string;
  badges?: CandidateBadge[];
  meta?: CandidateMetaItem[];
  score?: CandidateScore;
  isSelected: boolean;
  onClick: () => void;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export default function CandidateSummaryCard({
  name,
  subtitle,
  avatarUrl,
  badges = [],
  meta = [],
  score,
  isSelected,
  onClick,
}: CandidateSummaryCardProps) {
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
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-300 text-sm font-semibold text-slate-600">
                {getInitials(name) || "C"}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{name}</h3>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>

        {badges.length > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {badges.map((badge) => (
              <span
                key={badge.label}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {(meta.length > 0 || score) && (
        <div className="mt-4 flex items-end justify-between gap-3">
          {meta.length > 0 ? (
            <div className="space-y-2 text-xs text-slate-500">
              {meta.map((item) => (
                <div key={item.text} className="flex items-center gap-1">
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          ) : (
            <div />
          )}

          {score && (
            <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full bg-[#FFF1D6] text-slate-900">
              <span className="text-sm font-semibold">{score.value}%</span>
              <span className="text-[10px] text-slate-500">{score.label}</span>
            </div>
          )}
        </div>
      )}
    </button>
  );
}
