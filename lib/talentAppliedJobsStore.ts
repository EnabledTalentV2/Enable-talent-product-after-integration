"use client";

import { create } from "zustand";

export type AppliedJob = {
  id: string;
  title: string;
  status: "Active" | "Closed";
  location: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  companyIndustry?: string;
  hiringCount?: number;
  lastActive?: string;
  posted?: string;
  salary?: string;
  match?: number;
  jobType?: string;
  workMode?: string;
  yearsExperience?: string;
  about?: string;
  description?: string[];
  requirements?: string[];
};

type AppliedJobsStore = {
  appliedJobs: AppliedJob[];
  applyJob: (job: AppliedJob) => void;
};

export const useAppliedJobsStore = create<AppliedJobsStore>((set) => ({
  appliedJobs: [],
  applyJob: (job) =>
    set((state) => {
      if (state.appliedJobs.some((item) => item.id === job.id)) {
        return state;
      }
      return { appliedJobs: [job, ...state.appliedJobs] };
    }),
}));
