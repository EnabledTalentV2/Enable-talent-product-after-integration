'use client';

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { initialUserData } from "@/lib/userDataDefaults";
import type { UserData } from "@/components/signup/types";

type UserDataStore = {
  userData: UserData;
  setUserData: (updater: (prev: UserData) => UserData) => void;
  patchUserData: (patch: Partial<UserData>) => void;
  resetUserData: () => void;
};

export const useUserDataStore = create<UserDataStore>()(
  persist(
    (set) => ({
      userData: initialUserData,
      setUserData: (updater) => set((state) => ({ userData: updater(state.userData) })),
      patchUserData: (patch) => set((state) => ({ userData: { ...state.userData, ...patch } })),
      resetUserData: () => set({ userData: initialUserData }),
    }),
    {
      name: "et_user_data",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ userData: state.userData }),
    }
  )
);
