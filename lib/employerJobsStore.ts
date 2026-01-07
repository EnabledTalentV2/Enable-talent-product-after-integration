"use client";

import { create } from "zustand";
import type { EmployerJob, JobFormValues } from "@/lib/employerJobsTypes";

type EmployerJobsStore = {
  jobs: EmployerJob[];
  isLoading: boolean;
  hasFetched: boolean;
  fetchJobs: () => Promise<void>;
  createJob: (values: JobFormValues) => Promise<EmployerJob>;
  updateJob: (jobId: string, values: JobFormValues) => Promise<EmployerJob>;
  resetJobs: () => void;
};

const createJobId = (title: string, existingJobs: EmployerJob[]) => {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const baseId = slug || "job";
  const isAvailable = !existingJobs.some((job) => job.id === baseId);
  return isAvailable ? baseId : `${baseId}-${Date.now().toString(36)}`;
};

const buildJob = (
  values: JobFormValues,
  existingJobs: EmployerJob[]
): EmployerJob => ({
  ...values,
  id: createJobId(values.title, existingJobs),
  status: "Active",
  postedAt: new Date().toISOString(),
});

export const useEmployerJobsStore = create<EmployerJobsStore>((set, get) => ({
  jobs: [],
  isLoading: false,
  hasFetched: false,
  fetchJobs: async () => {
    set({ isLoading: true });
    set({ isLoading: false, hasFetched: true });
  },
  createJob: async (values) => {
    const previousJobs = get().jobs;
    const newJob = buildJob(values, previousJobs);
    const nextJobs = [newJob, ...previousJobs];
    set({ jobs: nextJobs, hasFetched: true });
    return newJob;
  },
  updateJob: async (jobId, values) => {
    const previousJobs = get().jobs;
    const jobIndex = previousJobs.findIndex((job) => job.id === jobId);
    if (jobIndex === -1) {
      throw new Error("Job not found.");
    }

    const updatedJob: EmployerJob = {
      ...previousJobs[jobIndex],
      ...values,
    };
    const nextJobs = [...previousJobs];
    nextJobs[jobIndex] = updatedJob;
    set({ jobs: nextJobs, hasFetched: true });
    return updatedJob;
  },
  resetJobs: () => set({ jobs: [], isLoading: false, hasFetched: false }),
}));
