"use client";

import { create } from "zustand";

export type EmployerOrganizationInfo = {
  organizationId?: number;
  organizationName: string;
  aboutOrganization: string;
  location: string;
  foundedYear: string;
  website: string;
  linkedinUrl: string;
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
    location: "",
    foundedYear: "",
    website: "",
    linkedinUrl: "",
    companySize: "",
    industry: "",
  },
};

type EmployerDataStore = {
  employerData: EmployerData;
  setEmployerData: (updater: (prev: EmployerData) => EmployerData) => void;
  patchEmployerData: (patch: Partial<EmployerData>) => void;
  patchOrganizationInfo: (patch: Partial<EmployerOrganizationInfo>) => void;
  resetEmployerData: () => void;
};

export const useEmployerDataStore = create<EmployerDataStore>((set) => ({
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
          ...(state.employerData.organizationInfo ??
            initialEmployerData.organizationInfo),
          ...patch,
        },
      },
    })),
  resetEmployerData: () => set({ employerData: initialEmployerData }),
}));
