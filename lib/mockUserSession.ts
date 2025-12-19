import type { UserData } from "@/components/signup/types";

let mockUserData: UserData | null = null;

export const setMockUserData = (data: UserData) => {
  mockUserData = data;
};

export const getMockUserData = () => mockUserData;

export const clearMockUserData = () => {
  mockUserData = null;
};
