"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type EmployerOrganizationInfo = {
  organizationName: string;
  aboutOrganization: string;
  location: string;
  foundedYear: string;
  website: string;
  companySize: string;
  industry: string;
};

export type EmployerData = {
  organizationInfo: EmployerOrganizationInfo;
};

const initialEmployerData: EmployerData = {
  organizationInfo: {
    organizationName: "",
    aboutOrganization: "",
    location: "Allentown, New Mexico 31134",
    foundedYear: "",
    website: "",
    companySize: "",
    industry: "Information Technology",
  },
};

type EmployerDataStore = {
  employerData: EmployerData;
  setEmployerData: (updater: (prev: EmployerData) => EmployerData) => void;
  patchEmployerData: (patch: Partial<EmployerData>) => void;
  patchOrganizationInfo: (patch: Partial<EmployerOrganizationInfo>) => void;
  resetEmployerData: () => void;
};

export const useEmployerDataStore = create<EmployerDataStore>()(
  persist(
    (set) => ({
      employerData: initialEmployerData,
      setEmployerData: (updater) =>
        set((state) => ({ employerData: updater(state.employerData) })),
      patchEmployerData: (patch) =>
        set((state) => ({
          employerData: { ...state.employerData, ...patch },
        })),
      patchOrganizationInfo: (patch) =>
        set((state) => ({
          employerData: {
            ...state.employerData,
            organizationInfo: {
              ...state.employerData.organizationInfo,
              ...patch,
            },
          },
        })),
      resetEmployerData: () => set({ employerData: initialEmployerData }),
    }),
    {
      name: "et_employer_data",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ employerData: state.employerData }),
    }
  )
);
