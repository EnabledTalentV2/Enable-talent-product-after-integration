"use client";

import { create } from "zustand";

export type CandidateProfile = Record<string, unknown>;

type CandidateProfileStore = {
  profile: CandidateProfile | null;
  slug: string | null;
  isLoading: boolean;
  error: string | null;
  setProfile: (profile: CandidateProfile | null) => void;
  setSlug: (slug: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

const initialState = {
  profile: null,
  slug: null,
  isLoading: false,
  error: null,
};

export const useCandidateProfileStore = create<CandidateProfileStore>((set) => ({
  ...initialState,
  setProfile: (profile) => set({ profile }),
  setSlug: (slug) => set({ slug }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ ...initialState }),
}));
