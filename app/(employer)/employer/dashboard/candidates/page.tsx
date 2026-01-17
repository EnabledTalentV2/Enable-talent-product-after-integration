"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, Briefcase, DollarSign, CheckCircle } from "lucide-react";
import { useCandidateProfiles } from "@/lib/hooks/useCandidateProfiles";
import Pagination from "@/components/ui/Pagination";
import Link from "next/link";

const ITEMS_PER_PAGE = 12;

export default function CandidatesListPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const { data: candidates, isLoading, error } = useCandidateProfiles();
  const [currentPage, setCurrentPage] = useState(1);

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

  // Pagination calculations
  const totalItems = filteredCandidates.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Paginated candidates
  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredCandidates.slice(startIndex, endIndex);
  }, [filteredCandidates, currentPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="mx-auto max-w-8xl space-y-6 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {searchQuery ? `Search Results for "${searchQuery}"` : "All Candidates"}
        </h1>
        <p className="mt-2 text-slate-600">
          {searchQuery
            ? "Use the search bar above to refine your search"
            : "Browse and manage candidate profiles"}
        </p>
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
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedCandidates.length > 0 ? (
              paginatedCandidates.map((candidate) => (
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

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
        </>
      )}
    </div>
  );
}
