"use client";

import { useMemo, useState } from "react";
import { Search, MapPin, Briefcase, DollarSign, CheckCircle } from "lucide-react";
import { useCandidateProfiles } from "@/lib/hooks/useCandidateProfiles";
import Link from "next/link";

export default function CandidatesListPage() {
  const { data: candidates, isLoading, error } = useCandidateProfiles();
  const [searchQuery, setSearchQuery] = useState("");

  // Debug: Log candidates data
  console.log("[Candidates Page] Raw data:", candidates);
  console.log("[Candidates Page] Data length:", candidates?.length);

  // Filter candidates based on search
  const filteredCandidates = useMemo(() => {
    if (!candidates) return [];
    if (!searchQuery.trim()) return candidates;

    const query = searchQuery.toLowerCase();
    return candidates.filter((candidate) => {
      const nameMatch = `${candidate.first_name} ${candidate.last_name}`
        .toLowerCase()
        .includes(query);
      const emailMatch = candidate.email?.toLowerCase().includes(query);
      const locationMatch = candidate.location?.toLowerCase().includes(query);

      return nameMatch || emailMatch || locationMatch;
    });
  }, [candidates, searchQuery]);

  return (
    <div className="mx-auto max-w-8xl space-y-6 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">All Candidates</h1>
        <p className="mt-2 text-slate-600">
          Browse and manage candidate profiles
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by name, email, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-12 text-base text-slate-800 shadow-sm focus:border-[#C27803] focus:outline-none focus:ring-2 focus:ring-[#C27803]/30"
        />
        <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#C27803] border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading candidates...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg bg-red-50 p-6 shadow-sm">
          <p className="font-semibold text-red-800">Failed to load candidates</p>
          <p className="mt-2 text-sm text-red-600">
            {error instanceof Error ? error.message : "Please try again later"}
          </p>
        </div>
      )}

      {/* Results Count */}
      {!isLoading && !error && filteredCandidates && (
        <div className="text-sm text-slate-600">
          Showing {filteredCandidates.length} candidate
          {filteredCandidates.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* Candidates Grid */}
      {!isLoading && !error && filteredCandidates && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCandidates.length > 0 ? (
            filteredCandidates.map((candidate) => (
              <Link
                key={candidate.id}
                href={`/employer/dashboard/candidates/profile/${candidate.slug}`}
                className="group block rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-[#C27803] hover:shadow-md"
              >
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#C27803]">
                      {candidate.first_name} {candidate.last_name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {candidate.email}
                    </p>
                  </div>
                  {candidate.is_verified && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2">
                  {candidate.location && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin size={16} className="text-slate-400" />
                      <span>{candidate.location}</span>
                    </div>
                  )}

                  {candidate.job_type && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Briefcase size={16} className="text-slate-400" />
                      <span>{candidate.job_type}</span>
                    </div>
                  )}

                  {(candidate.salary_min || candidate.salary_max) && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <DollarSign size={16} className="text-slate-400" />
                      <span>
                        {candidate.salary_min && `$${candidate.salary_min.toLocaleString()}`}
                        {candidate.salary_min && candidate.salary_max && " - "}
                        {candidate.salary_max && `$${candidate.salary_max.toLocaleString()}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-500">
                    {candidate.availability || "Availability not set"}
                  </span>
                  {candidate.resume_url && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      Resume
                    </span>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <p className="text-slate-600">
                {searchQuery
                  ? `No candidates found matching "${searchQuery}"`
                  : "No candidates available"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
