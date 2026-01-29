import React from "react";
import { JobInfo, JobStats } from "@/lib/types/candidates";

interface JobHeaderProps {
  jobInfo: JobInfo;
  stats: JobStats;
}

export default function JobHeader({ jobInfo, stats }: JobHeaderProps) {
  return (
    <div className="flex flex-col gap-6 rounded-[28px] bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      {/* Left: Job Info */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          {/* Placeholder Logo */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
          >
            <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">
              {jobInfo.title}
            </h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
              {jobInfo.status}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-600">
            {jobInfo.company}
          </p>
          <div className="mt-1 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {jobInfo.location}
            </span>
            <span>Posted {jobInfo.postedTime}</span>
          </div>
        </div>
      </div>

      {/* Right: Stats */}
      <div className="flex flex-wrap gap-3">
        <StatBox
          label="Accepted candidates"
          value={stats.accepted}
          color="bg-[#FCD34D]" // Yellow
        />
        <StatBox
          label="Rejected candidates"
          value={stats.declined}
          color="bg-slate-100"
        />
        <StatBox
          label="Requests sent"
          value={stats.requestsSent}
          color="bg-slate-100"
        />
        <StatBox
          label="Matching candidates"
          value={stats.matchingCandidates}
          color="bg-slate-100"
        />
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className={`flex min-w-[100px] flex-col justify-center rounded-xl px-4 py-3 ${color}`}
    >
      <span className="text-2xl font-bold text-slate-900">{value}</span>
      <span className="text-[10px] font-medium leading-tight text-slate-600">
        {label}
      </span>
    </div>
  );
}
