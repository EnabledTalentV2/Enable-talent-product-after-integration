import { Pencil, ArrowRight } from "lucide-react";
import Link from "next/link";

interface JobDetail {
  id: string;
  role: string;
  company: string;
  location: string;
  type: string; // Full Time
  workMode: string; // Hybrid
  experience: string; // 12 years
  salary: string;
  about: string;
  description: string[];
  requirements: string[];
  stats: {
    accepted: number;
    declined: number;
    requests: number;
    matching: number;
  };
}

interface JobDetailViewProps {
  job: JobDetail;
  getBrandStyle: (company: string) => string;
}

export default function JobDetailView({
  job,
  getBrandStyle,
}: JobDetailViewProps) {
  return (
    <div className="bg-white rounded-[28px] p-6 md:p-8 shadow-sm h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full text-xl font-semibold ${getBrandStyle(
              job.company
            )}`}
          >
            <span className="text-2xl">∞</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{job.role}</h1>
            <p className="text-slate-500">{job.company}</p>
          </div>
        </div>
        <Link
          href={`/employer/dashboard/post-jobs?jobId=${job.id}`}
          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
        >
          <Pencil className="h-5 w-5 text-slate-400" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4">
        <div className="bg-[#FFD566] rounded-xl p-4 flex flex-col justify-between h-24">
          <div className="text-3xl font-bold text-slate-900">
            {job.stats.accepted}
          </div>
          <div className="text-sm text-slate-800 leading-tight font-medium">
            Accepted
            <br />
            candidates
          </div>
        </div>
        <div className="bg-slate-100 rounded-xl p-4 flex flex-col justify-between h-24">
          <div className="text-3xl font-bold text-slate-900">
            {job.stats.declined}
          </div>
          <div className="text-sm text-slate-600 leading-tight">
            Declined
            <br />
            candidates
          </div>
        </div>
        <div className="bg-slate-100 rounded-xl p-4 flex flex-col justify-between h-24">
          <div className="text-3xl font-bold text-slate-900">
            {job.stats.requests}
          </div>
          <div className="text-sm text-slate-600 leading-tight">
            Requests
            <br />
            sent
          </div>
        </div>
        <div className="bg-slate-100 rounded-xl p-4 flex flex-col justify-between h-24">
          <div className="text-3xl font-bold text-slate-900">
            {job.stats.matching}
          </div>
          <div className="text-sm text-slate-600 leading-tight">
            Matching
            <br />
            candidates
          </div>
        </div>
      </div>

      {/* View Candidates Button */}
      <Link
        href={`/employer/dashboard/candidates/${job.id}`}
        className="w-full bg-[#C27831] hover:bg-[#A66528] text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-medium mb-8 transition-colors"
      >
        View Candidates
        <ArrowRight className="h-4 w-4" />
      </Link>

      <hr className="border-slate-100 mb-8" />

      {/* Job Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4 sm:gap-6">
        <div>
          <div className="text-xs text-slate-500 mb-1">Job Type</div>
          <div className="font-semibold text-slate-900">{job.type}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Location</div>
          <div className="font-semibold text-slate-900">{job.location}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Job Type</div>
          <div className="font-semibold text-slate-900">{job.workMode}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Years of Experience</div>
          <div className="font-semibold text-slate-900">{job.experience}</div>
        </div>
      </div>

      {/* Salary */}
      <div className="mb-8">
        <div className="text-xs text-slate-500 mb-1">Salary</div>
        <div className="text-xl font-bold text-slate-900">{job.salary}</div>
      </div>

      <hr className="border-slate-100 mb-8" />

      {/* About */}
      <div className="mb-8">
        <h3 className="font-bold text-slate-900 mb-3">About the job</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{job.about}</p>
      </div>

      {/* Description */}
      <div className="mb-8">
        <h3 className="font-bold text-slate-900 mb-3">Description</h3>
        <ul className="list-disc list-outside ml-4 space-y-2">
          {job.description.map((item, index) => (
            <li
              key={index}
              className="text-sm text-slate-600 leading-relaxed pl-1"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Requirements */}
      <div>
        <h3 className="font-bold text-slate-900 mb-3">Requirement</h3>
        <ul className="list-disc list-outside ml-4 space-y-2">
          {job.requirements.map((item, index) => (
            <li
              key={index}
              className="text-sm text-slate-600 leading-relaxed pl-1"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
