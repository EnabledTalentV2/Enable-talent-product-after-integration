'use client';

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { initialUserData } from "@/lib/userDataDefaults";
import type { UserData } from "@/lib/types/user";
import type { DeepPartialUserData } from "@/lib/candidateProfileUtils";

type UserDataStore = {
  userData: UserData;
  signupCompletedAt: number | null;
  setUserData: (updater: (prev: UserData) => UserData) => void;
  patchUserData: (patch: Partial<UserData> | DeepPartialUserData) => void;
  markSignupComplete: () => void;
  clearSignupComplete: () => void;
  resetUserData: () => void;
};

const normalizeUserData = (
  value: Partial<UserData> | DeepPartialUserData | null | undefined
): UserData => {
  const safe = value && typeof value === "object" ? value : {};
  const accessibility = safe.accessibilityNeeds;
  const defaultAccessibility =
    initialUserData.accessibilityNeeds ?? {
      categories: [],
      accommodationNeed: "",
      disclosurePreference: "",
      accommodations: [],
    };

  return {
    basicInfo: { ...initialUserData.basicInfo, ...safe.basicInfo },
    education: { ...initialUserData.education, ...safe.education },
    workExperience: {
      ...initialUserData.workExperience,
      ...safe.workExperience,
      entries: Array.isArray(safe.workExperience?.entries)
        ? safe.workExperience.entries
        : initialUserData.workExperience.entries,
    },
    skills: { ...initialUserData.skills, ...safe.skills },
    projects: {
      ...initialUserData.projects,
      ...safe.projects,
      entries: Array.isArray(safe.projects?.entries)
        ? safe.projects.entries
        : initialUserData.projects.entries,
    },
    achievements: {
      ...initialUserData.achievements,
      ...safe.achievements,
      entries: Array.isArray(safe.achievements?.entries)
        ? safe.achievements.entries
        : initialUserData.achievements.entries,
    },
    certification: {
      ...initialUserData.certification,
      ...safe.certification,
      entries: Array.isArray(safe.certification?.entries)
        ? safe.certification.entries
        : initialUserData.certification.entries,
    },
    preference: { ...initialUserData.preference, ...safe.preference },
    otherDetails: {
      ...initialUserData.otherDetails,
      ...safe.otherDetails,
      languages: Array.isArray(safe.otherDetails?.languages)
        ? safe.otherDetails.languages
        : initialUserData.otherDetails.languages,
    },
    reviewAgree: { ...initialUserData.reviewAgree, ...safe.reviewAgree },
    accessibilityNeeds: {
      categories: accessibility?.categories ?? defaultAccessibility.categories,
      accommodationNeed:
        accessibility?.accommodationNeed ?? defaultAccessibility.accommodationNeed,
      disclosurePreference:
        accessibility?.disclosurePreference ??
        defaultAccessibility.disclosurePreference,
      accommodations:
        accessibility?.accommodations ?? defaultAccessibility.accommodations,
    },
  };
};

export const useUserDataStore = create<UserDataStore>()(
  persist(
    (set) => ({
      userData: normalizeUserData(initialUserData),
      signupCompletedAt: null,
      setUserData: (updater) =>
        set((state) => ({
          userData: normalizeUserData(updater(state.userData)),
        })),
      patchUserData: (patch) =>
        set((state) => ({
          userData: normalizeUserData({ ...state.userData, ...patch }),
        })),
      markSignupComplete: () => set({ signupCompletedAt: Date.now() }),
      clearSignupComplete: () => set({ signupCompletedAt: null }),
      resetUserData: () =>
        set({ userData: initialUserData, signupCompletedAt: null }),
    }),
    {
      name: "et_user_data",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userData: state.userData,
        signupCompletedAt: state.signupCompletedAt,
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<UserDataStore> | undefined;
        return {
          ...current,
          ...persistedState,
          userData: normalizeUserData(persistedState?.userData),
          signupCompletedAt: persistedState?.signupCompletedAt ?? null,
        };
      },
    }
  )
);
