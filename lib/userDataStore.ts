'use client';

import { create } from "zustand";
import { initialUserData } from "@/lib/userDataDefaults";
import type { UserData } from "@/components/signup/types";

type UserDataStore = {
  userData: UserData;
  setUserData: (updater: (prev: UserData) => UserData) => void;
  patchUserData: (patch: Partial<UserData>) => void;
  resetUserData: () => void;
};

export const useUserDataStore = create<UserDataStore>((set) => ({
  userData: initialUserData,
  setUserData: (updater) => set((state) => ({ userData: updater(state.userData) })),
  patchUserData: (patch) => set((state) => ({ userData: { ...state.userData, ...patch } })),
  resetUserData: () => set({ userData: initialUserData }),
}));
