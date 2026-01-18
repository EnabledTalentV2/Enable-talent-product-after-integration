import React from "react";

interface CandidateListSkeletonProps {
  count?: number;
}

export function CandidateListSkeleton({ count = 6 }: CandidateListSkeletonProps) {
  return (
    <div aria-hidden="true" className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`candidate-skeleton-${index}`}
          className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <div className="h-12 w-12 rounded-full bg-slate-200" />
              <div className="space-y-2">
                <div className="h-3 w-28 rounded bg-slate-200" />
                <div className="h-3 w-20 rounded bg-slate-200" />
              </div>
            </div>
            <div className="h-5 w-16 rounded-full bg-slate-200" />
          </div>

          <div className="mt-4 flex items-end justify-between gap-3">
            <div className="space-y-2">
              <div className="h-3 w-32 rounded bg-slate-200" />
              <div className="h-3 w-24 rounded bg-slate-200" />
            </div>
            <div className="h-12 w-12 rounded-full bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CandidateDetailSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-4">
      <div className="animate-pulse rounded-[28px] bg-[#FFD58C] p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-white/70" />
            <div className="space-y-2">
              <div className="h-4 w-40 rounded bg-white/80" />
              <div className="h-3 w-28 rounded bg-white/80" />
            </div>
          </div>
          <div className="h-14 w-14 rounded-full bg-white/80" />
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <div className="h-3 w-40 rounded bg-white/80" />
          <div className="h-3 w-28 rounded bg-white/80" />
          <div className="h-3 w-24 rounded bg-white/80" />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <div className="h-10 w-44 rounded-xl bg-white/80" />
          <div className="h-10 w-44 rounded-xl bg-white/80" />
        </div>
      </div>

      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`candidate-detail-skeleton-${index}`}
          className="animate-pulse rounded-2xl bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 rounded bg-slate-200" />
            <div className="h-4 w-8 rounded bg-slate-200" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-3 w-full rounded bg-slate-200" />
            <div className="h-3 w-5/6 rounded bg-slate-200" />
            <div className="h-3 w-4/6 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
