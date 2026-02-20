"use client";

import { ArrowRight, Briefcase, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

interface JobDetail {
  id: string | number;
  role: string;
  company: string;
  location: string;
  type: string; // Full Time
  workMode: string; // Hybrid
  experience: string; // 12 years
  salary: string;
  about: string;
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
  onDelete?: (jobId: string | number) => void;
}

export default function JobDetailView({
  job,
  onDelete,
}: JobDetailViewProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(job.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Failed to delete job:", error);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-[28px] p-6 md:p-8 shadow-sm h-full">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <Briefcase className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{job.role}</h1>
              <p className="text-slate-700">{job.company}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/employer/dashboard/edit-job/${job.id}`}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
            >
              <Pencil className="h-5 w-5 text-slate-400" />
            </Link>
            {onDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
              >
                <Trash2 className="h-5 w-5 text-red-900" aria-hidden="true" />
              </button>
            )}
          </div>
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
          <div className="text-sm text-slate-700 leading-tight">
            Declined
            <br />
            candidates
          </div>
        </div>
        <div className="bg-slate-100 rounded-xl p-4 flex flex-col justify-between h-24">
          <div className="text-3xl font-bold text-slate-900">
            {job.stats.requests}
          </div>
          <div className="text-sm text-slate-700 leading-tight">
            Requests
            <br />
            sent
          </div>
        </div>
        <div className="bg-slate-100 rounded-xl p-4 flex flex-col justify-between h-24">
          <div className="text-3xl font-bold text-slate-900">
            {job.stats.matching}
          </div>
          <div className="text-sm text-slate-700 leading-tight">
            Matching
            <br />
            candidates
          </div>
        </div>
      </div>

      {/* View Candidates Button */}
      <Link
        href={`/employer/dashboard/candidates/${job.id}`}
        className="w-full bg-orange-900 hover:bg-orange-950 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-medium mb-8 transition-colors"
      >
        View Candidates
        <ArrowRight className="h-4 w-4" />
      </Link>

      <hr className="border-slate-100 mb-8" />

      {/* Job Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4 sm:gap-6">
        <div>
          <div className="text-xs text-slate-700 mb-1">Job Type</div>
          <div className="font-semibold text-slate-900">{job.type}</div>
        </div>
        <div>
          <div className="text-xs text-slate-700 mb-1">Location</div>
          <div className="font-semibold text-slate-900">{job.location}</div>
        </div>
        <div>
          <div className="text-xs text-slate-700 mb-1">Job Type</div>
          <div className="font-semibold text-slate-900">{job.workMode}</div>
        </div>
      </div>

      {/* Salary */}
      <div className="mb-8">
        <div className="text-xs text-slate-700 mb-1">Salary</div>
        <div className="text-xl font-bold text-slate-900">{job.salary}</div>
      </div>

      <hr className="border-slate-100 mb-8" />

      {/* About */}
      <div className="mb-8">
        <h3 className="font-bold text-slate-900 mb-3">About the job</h3>
        <div className="text-sm text-slate-700 leading-relaxed prose prose-slate max-w-none whitespace-pre-wrap break-words">
          <ReactMarkdown
            rehypePlugins={[rehypeSanitize]}
            components={{
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-900 underline hover:text-orange-900"
                >
                  {children}
                </a>
              ),
            }}
          >
            {job.about}
          </ReactMarkdown>
        </div>
      </div>

    </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-800" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Delete Job Post</h2>
            </div>

            <p className="text-slate-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">{job.role}</span>?
              This action cannot be undone and all associated applications will be removed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
