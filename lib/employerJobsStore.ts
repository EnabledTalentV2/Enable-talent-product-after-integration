"use client";

import { create } from "zustand";
import type { EmployerJob, JobFormValues } from "@/lib/employerJobsTypes";
import { apiRequest } from "@/lib/api-client";
import { parseJobsArray, toBackendJobPayload } from "@/lib/employerJobsUtils";

type EmployerJobsStore = {
  jobs: EmployerJob[];
  isLoading: boolean;
  hasFetched: boolean;
  fetchJobs: () => Promise<void>;
  createJob: (values: JobFormValues) => Promise<EmployerJob>;
  updateJob: (jobId: string | number, values: JobFormValues) => Promise<EmployerJob>;
  deleteJob: (jobId: string | number) => Promise<void>;
  resetJobs: () => void;
};

export const useEmployerJobsStore = create<EmployerJobsStore>((set, get) => ({
  jobs: [],
  isLoading: false,
  hasFetched: false,
  fetchJobs: async () => {
    set({ isLoading: true });
    try {
      console.log("[Jobs Store] Fetching jobs from API...");
      const data = await apiRequest<unknown>("/api/jobs", { method: "GET" });
      console.log("[Jobs Store] Received data:", data);

      const parsedJobs = parseJobsArray(data);
      console.log("[Jobs Store] Parsed jobs:", parsedJobs.length);

      set({ jobs: parsedJobs, hasFetched: true, isLoading: false });
    } catch (error) {
      console.error("[Jobs Store] Failed to fetch jobs:", error);
      set({ jobs: [], hasFetched: true, isLoading: false });
    }
  },
  createJob: async (values) => {
    try {
      console.log("[Jobs Store] Creating job...", values);

      // Map frontend values to backend format
      const backendPayload = toBackendJobPayload(values);
      console.log("[Jobs Store] Backend payload:", backendPayload);

      // Call backend API
      const response = await apiRequest<unknown>("/api/jobs", {
        method: "POST",
        body: JSON.stringify(backendPayload),
      });

      console.log("[Jobs Store] Backend response:", response);

      // Parse response - backend returns single job object
      const parsedJobs = parseJobsArray(response);
      if (parsedJobs.length === 0) {
        throw new Error("Failed to parse created job from backend response");
      }

      const newJob = parsedJobs[0];
      console.log("[Jobs Store] Parsed new job:", newJob);

      // Add to store
      const previousJobs = get().jobs;
      const nextJobs = [newJob, ...previousJobs];
      set({ jobs: nextJobs, hasFetched: true });

      return newJob;
    } catch (error) {
      console.error("[Jobs Store] Failed to create job:", error);
      throw error; // Re-throw to show error toast in UI
    }
  },
  updateJob: async (jobId, values) => {
    try {
      console.log("[Jobs Store] Updating job...", jobId, values);

      // Map frontend values to backend format
      const backendPayload = toBackendJobPayload(values);
      console.log("[Jobs Store] Backend payload:", backendPayload);

      // Call backend API
      const response = await apiRequest<unknown>(`/api/jobs/${jobId}`, {
        method: "PATCH",
        body: JSON.stringify(backendPayload),
      });

      console.log("[Jobs Store] Backend response:", response);

      // Parse response - backend returns single job object
      const parsedJobs = parseJobsArray(response);
      if (parsedJobs.length === 0) {
        throw new Error("Failed to parse updated job from backend response");
      }

      const updatedJob = parsedJobs[0];
      console.log("[Jobs Store] Parsed updated job:", updatedJob);

      // Update in store
      const previousJobs = get().jobs;
      const jobIndex = previousJobs.findIndex((job) => job.id === jobId);
      if (jobIndex === -1) {
        throw new Error("Job not found.");
      }

      const nextJobs = [...previousJobs];
      nextJobs[jobIndex] = updatedJob;
      set({ jobs: nextJobs, hasFetched: true });

      return updatedJob;
    } catch (error) {
      console.error("[Jobs Store] Failed to update job:", error);
      throw error; // Re-throw to show error toast in UI
    }
  },
  deleteJob: async (jobId) => {
    try {
      console.log("[Jobs Store] Deleting job...", jobId);

      // Call backend API
      await apiRequest<unknown>(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });

      console.log("[Jobs Store] Job deleted successfully");

      // Remove from store
      const previousJobs = get().jobs;
      const nextJobs = previousJobs.filter((job) => job.id !== jobId);
      set({ jobs: nextJobs, hasFetched: true });
    } catch (error) {
      console.error("[Jobs Store] Failed to delete job:", error);
      throw error; // Re-throw to show error toast in UI
    }
  },
  resetJobs: () => set({ jobs: [], isLoading: false, hasFetched: false }),
}));
