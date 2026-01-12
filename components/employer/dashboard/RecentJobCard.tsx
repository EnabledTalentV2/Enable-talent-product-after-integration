import { MapPin } from "lucide-react";
import Link from "next/link";

interface RecentJob {
  id: string | number;
  role: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  postedTime: string;
  stats: {
    accepted: number;
    declined: number;
    matching: number;
  };
}

interface RecentJobCardProps {
  job: RecentJob;
  getBrandStyle: (company: string) => string;
}

export default function RecentJobCard({
  job,
  getBrandStyle,
}: RecentJobCardProps) {
  return (
    <Link
      href={`/employer/dashboard/listed-jobs?jobId=${job.id}`}
      className="block rounded-[28px] bg-white p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <p className="text-xs text-slate-400 mb-3">{job.postedTime}</p>
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

      <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-4 text-sm text-slate-500 sm:gap-6">
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
    </Link>
  );
}
