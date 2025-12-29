"use client";

import { create } from "zustand";
import { getCurrentEmployer } from "@/lib/localEmployerStore";
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

const JOBS_KEY_PREFIX = "et_employer_jobs_";

const isBrowser = () => typeof window !== "undefined";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getEmployerEmail = () => {
  const employer = getCurrentEmployer();
  if (!employer?.email) {
    throw new Error("Missing employer session.");
  }

  return normalizeEmail(employer.email);
};

const getJobsStorageKey = (email: string) => `${JOBS_KEY_PREFIX}${email}`;

const readJobsFromStorage = (email: string): EmployerJob[] => {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(getJobsStorageKey(email));
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((job) => job && typeof job.id === "string")
      .map((job) => ({
        id: job.id,
        title: job.title ?? "",
        company: job.company ?? "",
        location: job.location ?? "",
        address: job.address ?? "",
        experience: job.experience ?? "",
        employmentType: job.employmentType ?? "",
        workArrangement: job.workArrangement ?? "",
        preferredLanguage: job.preferredLanguage ?? "",
        urgentHiring: job.urgentHiring ?? "",
        description: job.description ?? "",
        requirements: job.requirements ?? "",
        salary: job.salary ?? "",
        status: job.status ?? "Active",
        postedAt: job.postedAt ?? new Date().toISOString(),
      }));
  } catch {
    return [];
  }
};

const writeJobsToStorage = (email: string, jobs: EmployerJob[]) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(getJobsStorageKey(email), JSON.stringify(jobs));
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
    try {
      const email = getEmployerEmail();
      await delay(150);
      const jobs = readJobsFromStorage(email);
      set({ jobs, isLoading: false, hasFetched: true });
    } catch (error) {
      set({ isLoading: false, hasFetched: true });
      throw error;
    }
  },
  createJob: async (values) => {
    const email = getEmployerEmail();
    const previousJobs = get().jobs;
    const newJob = buildJob(values, previousJobs);
    const nextJobs = [newJob, ...previousJobs];
    set({ jobs: nextJobs, hasFetched: true });

    try {
      await delay(150);
      writeJobsToStorage(email, nextJobs);
      return newJob;
    } catch (error) {
      set({ jobs: previousJobs });
      throw error;
    }
  },
  updateJob: async (jobId, values) => {
    const email = getEmployerEmail();
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

    try {
      await delay(150);
      writeJobsToStorage(email, nextJobs);
      return updatedJob;
    } catch (error) {
      set({ jobs: previousJobs });
      throw error;
    }
  },
  resetJobs: () => set({ jobs: [], isLoading: false, hasFetched: false }),
}));
