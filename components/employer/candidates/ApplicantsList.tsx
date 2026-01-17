"use client";

import { useRouter } from "next/navigation";
import CandidateDecisionButtons from "./CandidateDecisionButtons";
import Pagination from "@/components/ui/Pagination";
import type { CandidateDecisionStatus } from "@/lib/types/candidate-decision";

export interface Application {
  id: number;
  candidate: {
    id: number;
    slug: string;
    name: string;
    email: string;
    avatar?: string;
  };
  status: CandidateDecisionStatus | "applied";
  applied_at: string;
}

interface ApplicantsListProps {
  applications: Application[];
  jobId: string;
  isLoading?: boolean;
  onDecisionUpdate?: () => void;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

const STATUS_BADGES = {
  applied: { label: "Applied", color: "bg-blue-100 text-blue-700" },
  shortlisted: { label: "Shortlisted", color: "bg-yellow-100 text-yellow-700" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
  hired: { label: "Hired", color: "bg-green-100 text-green-700" },
};

export default function ApplicantsList({
  applications,
  jobId,
  isLoading,
  onDecisionUpdate,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: ApplicantsListProps) {
  const router = useRouter();
  const showPagination = totalPages !== undefined && totalPages > 1 && onPageChange;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#C27803]"></div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        No applicants yet for this position.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-4 overflow-auto">
        {applications.map((application) => {
          const statusBadge = STATUS_BADGES[application.status];

          return (
            <div
              key={application.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md"
            >
              {/* Left Section: Avatar + Info */}
              <div
                className="flex flex-1 cursor-pointer items-center gap-4"
                onClick={() =>
                  router.push(
                    `/employer/dashboard/candidates/profile/${application.candidate.slug}?jobId=${jobId}&applicationId=${application.id}`
                  )
                }
              >
                {/* Avatar */}
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-slate-200">
                  {application.candidate.avatar ? (
                    <img
                      src={application.candidate.avatar}
                      alt={`Profile photo of ${application.candidate.name}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-xl font-semibold text-slate-600"
                      role="img"
                      aria-label={`${application.candidate.name} avatar placeholder`}
                    >
                      {application.candidate.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-1">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {application.candidate.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {application.candidate.email}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>Applied: {formatDate(application.applied_at)}</span>
                    <span className={`rounded-full px-2 py-1 ${statusBadge.color}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Section: Decision Buttons */}
              {application.status === "applied" && (
                <div className="ml-4 shrink-0">
                  <CandidateDecisionButtons
                    jobId={jobId}
                    applicationId={application.id.toString()}
                    variant="compact"
                    currentStatus={undefined}
                    onDecisionUpdate={onDecisionUpdate}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="shrink-0 border-t border-slate-100 pt-4 mt-4">
          <Pagination
            currentPage={currentPage!}
            totalPages={totalPages!}
            onPageChange={onPageChange!}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </div>
  );
}
