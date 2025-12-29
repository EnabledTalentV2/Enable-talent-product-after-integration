import React, { useState } from "react";
import { X, Search, Check } from "lucide-react";
import { MOCK_JOBS } from "@/app/(employer)/employer/dashboard/mock-db";

interface SendInvitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendInvites: (selectedJobIds: string[]) => void;
}

export default function SendInvitesModal({
  isOpen,
  onClose,
  onSendInvites,
}: SendInvitesModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleJobSelection = (jobId: string) => {
    setSelectedJobIds((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  const filteredJobs = MOCK_JOBS.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-2">
          <h2 className="text-xl font-bold text-slate-900">
            Choose the jobs you want to send the invites
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 px-6 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#C27803] focus:ring-1 focus:ring-[#C27803]"
            />
          </div>
          <button className="rounded-xl bg-[#E85D04] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#d05304]">
            Filters
          </button>
        </div>

        {/* Job List */}
        <div className="max-h-[400px] overflow-y-auto px-6 pb-4">
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const isSelected = selectedJobIds.includes(job.id);
              return (
                <div
                  key={job.id}
                  onClick={() => toggleJobSelection(job.id)}
                  className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                    isSelected
                      ? "border-[#C27803] bg-orange-50/30"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      Posted {job.postedTime}
                    </span>
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-md border transition-colors ${
                        isSelected
                          ? "border-[#C27803] bg-[#C27803] text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="h-4 w-4" />}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-slate-100">
                      {/* Placeholder for Company Logo - using first letter of company */}
                      <div className="flex h-full w-full items-center justify-center bg-blue-100 text-xl font-bold text-blue-600">
                        {job.company.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">{job.title}</h3>
                      <p className="text-sm text-slate-500">{job.company}</p>

                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                        <svg
                          className="h-4 w-4 text-[#E85D04]"
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
                        {job.location}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                          {job.experience}
                        </span>
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                          {job.type}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-6 border-t border-slate-100 pt-3 text-xs font-medium text-slate-600">
                        <span>
                          Accepted: <span className="text-slate-900">56</span>
                        </span>
                        <span>
                          Declined: <span className="text-slate-900">367</span>
                        </span>
                        <span>
                          Matching: <span className="text-slate-900">97</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-6">
          <button
            onClick={() => onSendInvites(selectedJobIds)}
            disabled={selectedJobIds.length === 0}
            className="w-full rounded-xl bg-[#C27803] py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#a36502] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send Invites
          </button>
        </div>
      </div>
    </div>
  );
}
