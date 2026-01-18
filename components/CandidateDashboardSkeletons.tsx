import React from "react";

function ProfilePromptSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-gradient-to-r from-[#C94A2A] via-[#D96C3B] to-[#F1B45C] p-6 text-white shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="h-4 w-32 rounded bg-white/70" />
          <div className="h-6 w-56 rounded bg-white/70" />
          <div className="h-10 w-32 rounded bg-white/70" />
        </div>
        <div className="h-28 w-28 rounded-full bg-white/70" />
      </div>
    </div>
  );
}

export function CandidateHomeSkeleton() {
  return (
    <main id="main-content" aria-busy="true" aria-labelledby="dashboard-heading">
      <h1 id="dashboard-heading" className="sr-only">
        Talent Dashboard
      </h1>
      <section className="mx-auto max-w-360 space-y-6 py-10">
        <div className="sr-only">Loading your dashboard...</div>
        <ProfilePromptSkeleton />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
          <div className="space-y-6">
            <div className="animate-pulse rounded-[28px] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-slate-200" />
                <div className="space-y-2">
                  <div className="h-4 w-36 rounded bg-slate-200" />
                  <div className="h-4 w-24 rounded bg-slate-200" />
                </div>
              </div>
            </div>

            <div className="animate-pulse rounded-[28px] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="h-8 w-8 rounded-full bg-slate-200" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full rounded bg-slate-200" />
                <div className="h-3 w-5/6 rounded bg-slate-200" />
                <div className="h-3 w-2/3 rounded bg-slate-200" />
              </div>
            </div>

            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`home-section-skeleton-${index}`}
                  className="animate-pulse rounded-[28px] bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 w-28 rounded bg-slate-200" />
                      <div className="h-3 w-16 rounded bg-slate-200" />
                    </div>
                    <div className="h-8 w-8 rounded-full bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
              <div className="h-4 w-20 rounded bg-slate-200 animate-pulse" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`home-notification-skeleton-${index}`}
                  className="animate-pulse rounded-[28px] bg-white p-5 shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="h-4 w-48 rounded bg-slate-200" />
                    <div className="h-3 w-24 rounded bg-slate-200" />
                  </div>
                  <div className="mt-4 flex gap-3">
                    <div className="h-9 w-24 rounded-lg bg-slate-200" />
                    <div className="h-9 w-24 rounded-lg bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export function CandidateMyJobsSkeleton() {
  return (
    <section className="mx-auto max-w-360 space-y-6 py-10" aria-busy="true">
      <div className="sr-only">Loading your jobs...</div>
      <ProfilePromptSkeleton />

      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`my-jobs-filter-skeleton-${index}`}
            className="h-10 w-24 rounded-xl bg-slate-200 animate-pulse"
          />
        ))}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full space-y-4 lg:w-[450px] lg:shrink-0">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`my-jobs-card-skeleton-${index}`}
              className="animate-pulse rounded-[32px] border-2 border-slate-100 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 rounded bg-slate-200" />
                <div className="h-6 w-20 rounded-full bg-slate-200" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-5 w-40 rounded bg-slate-200" />
                <div className="h-4 w-32 rounded bg-slate-200" />
              </div>
              <div className="mt-6 space-y-2">
                <div className="h-4 w-36 rounded bg-slate-200" />
                <div className="h-4 w-28 rounded bg-slate-200" />
                <div className="h-4 w-24 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>

        <div className="w-full rounded-[40px] bg-white p-6 shadow-sm md:p-10 lg:flex-1">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-6 w-48 rounded bg-slate-200" />
                <div className="h-4 w-32 rounded bg-slate-200" />
              </div>
              <div className="h-9 w-24 rounded-full bg-slate-200" />
            </div>

            <div className="rounded-[28px] bg-slate-100 p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`my-jobs-meta-skeleton-${index}`}
                    className="h-14 rounded bg-slate-200"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-5 w-40 rounded bg-slate-200" />
              <div className="h-3 w-full rounded bg-slate-200" />
              <div className="h-3 w-5/6 rounded bg-slate-200" />
              <div className="h-3 w-2/3 rounded bg-slate-200" />
            </div>

            <div className="space-y-2">
              <div className="h-5 w-32 rounded bg-slate-200" />
              <div className="h-3 w-full rounded bg-slate-200" />
              <div className="h-3 w-4/5 rounded bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CandidateProfileSkeleton() {
  return (
    <div className="max-w-360 mx-auto space-y-8 py-8" aria-busy="true">
      <div className="sr-only">Loading profile...</div>
      <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="h-32 w-32 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="h-6 w-48 rounded bg-slate-200" />
                <div className="h-4 w-32 rounded bg-slate-200" />
              </div>
              <div className="h-10 w-32 rounded-xl bg-slate-200" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`profile-contact-skeleton-${index}`}
                  className="h-4 w-40 rounded bg-slate-200"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`profile-left-skeleton-${index}`}
              className="animate-pulse rounded-3xl bg-white p-8 shadow-sm"
            >
              <div className="h-5 w-40 rounded bg-slate-200" />
              <div className="mt-6 space-y-3">
                <div className="h-3 w-full rounded bg-slate-200" />
                <div className="h-3 w-5/6 rounded bg-slate-200" />
                <div className="h-3 w-4/6 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`profile-right-skeleton-${index}`}
              className="animate-pulse rounded-3xl bg-white p-8 shadow-sm"
            >
              <div className="h-5 w-32 rounded bg-slate-200" />
              <div className="mt-6 space-y-2">
                <div className="h-3 w-5/6 rounded bg-slate-200" />
                <div className="h-3 w-3/4 rounded bg-slate-200" />
                <div className="h-3 w-2/3 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
