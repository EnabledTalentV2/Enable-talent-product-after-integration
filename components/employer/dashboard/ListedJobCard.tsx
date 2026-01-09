import { MapPin } from "lucide-react";

interface ListedJob {
  id: string | number;
  role: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  postedTime: string;
  status: "Active" | "Closed" | "Draft";
  stats: {
    accepted: number;
    declined: number;
    matching: number;
  };
}

interface ListedJobCardProps {
  job: ListedJob;
  isSelected?: boolean;
  onClick?: () => void;
  getBrandStyle: (company: string) => string;
}

export default function ListedJobCard({
  job,
  isSelected,
  onClick,
  getBrandStyle,
}: ListedJobCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={Boolean(isSelected)}
      className={`w-full text-left rounded-[28px] p-5 shadow-sm cursor-pointer transition-all border-2 ${
        isSelected
          ? "border-orange-400 bg-white"
          : "border-transparent bg-white hover:border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-400">Posted {job.postedTime}</p>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            job.status === "Active"
              ? "bg-green-50 text-green-600"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {job.status}
        </span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-full text-base font-semibold ${getBrandStyle(
              job.company
            )}`}
          >
            <span className="text-xl">∞</span>
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">{job.role}</p>
            <p className="text-sm text-slate-500">{job.company}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
        <MapPin className="h-4 w-4" />
        {job.location}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
        <span className="rounded-full bg-green-50 text-green-700 px-3 py-1 font-medium">
          {job.experience}
        </span>
        <span className="rounded-full bg-green-50 text-green-700 px-3 py-1 font-medium">
          {job.type}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-6 text-sm text-slate-500 border-t pt-4">
        <span>
          Accepted:{" "}
          <span className="font-semibold text-slate-900">
            {job.stats.accepted}
          </span>
        </span>
        <span>
          Declined:{" "}
          <span className="font-semibold text-slate-900">
            {job.stats.declined}
          </span>
        </span>
        <span>
          Matching:{" "}
          <span className="font-semibold text-slate-900">
            {job.stats.matching}
          </span>
        </span>
      </div>
    </button>
  );
}
