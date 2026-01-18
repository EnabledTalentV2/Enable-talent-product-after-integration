import React from "react";

interface ListedJobsListSkeletonProps {
  count?: number;
}

export function ListedJobsListSkeleton({
  count = 4,
}: ListedJobsListSkeletonProps) {
  return (
    <div aria-hidden="true" className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`listed-job-skeleton-${index}`}
          className="animate-pulse rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="h-3 w-20 rounded bg-slate-200" />
            <div className="h-5 w-16 rounded-full bg-slate-200" />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-slate-200" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-slate-200" />
              <div className="h-3 w-24 rounded bg-slate-200" />
            </div>
          </div>

          <div className="mt-3 h-3 w-40 rounded bg-slate-200" />
          <div className="mt-3 h-6 w-24 rounded-full bg-slate-200" />

          <div className="mt-4 flex items-center gap-6 border-t border-slate-100 pt-4">
            <div className="h-3 w-20 rounded bg-slate-200" />
            <div className="h-3 w-20 rounded bg-slate-200" />
            <div className="h-3 w-20 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListedJobDetailSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse rounded-[28px] bg-white p-6 md:p-8 shadow-sm">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-slate-200" />
          <div className="space-y-2">
            <div className="h-5 w-40 rounded bg-slate-200" />
            <div className="h-4 w-24 rounded bg-slate-200" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-9 rounded-full bg-slate-200" />
          <div className="h-9 w-9 rounded-full bg-slate-200" />
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`listed-job-stat-skeleton-${index}`}
            className="h-24 rounded-xl bg-slate-200"
          />
        ))}
      </div>

      <div className="mb-8 h-11 rounded-xl bg-slate-200" />

      <div className="mb-8 h-px bg-slate-100" />

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={`listed-job-detail-meta-${index}`} className="space-y-2">
            <div className="h-3 w-16 rounded bg-slate-200" />
            <div className="h-4 w-24 rounded bg-slate-200" />
          </div>
        ))}
      </div>

      <div className="mb-8 space-y-2">
        <div className="h-3 w-20 rounded bg-slate-200" />
        <div className="h-6 w-32 rounded bg-slate-200" />
      </div>

      <div className="mb-8 h-px bg-slate-100" />

      <div className="mb-8 space-y-2">
        <div className="h-4 w-28 rounded bg-slate-200" />
        <div className="h-3 w-full rounded bg-slate-200" />
        <div className="h-3 w-5/6 rounded bg-slate-200" />
      </div>

      <div className="space-y-2">
        <div className="h-4 w-28 rounded bg-slate-200" />
        <div className="h-3 w-full rounded bg-slate-200" />
        <div className="h-3 w-11/12 rounded bg-slate-200" />
        <div className="h-3 w-3/4 rounded bg-slate-200" />
      </div>
    </div>
  );
}
