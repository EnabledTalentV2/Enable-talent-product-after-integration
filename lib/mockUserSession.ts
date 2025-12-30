import type { UserData } from "@/lib/types/user";

let mockUserData: UserData | null = null;

export const setMockUserData = (data: UserData) => {
  mockUserData = data;
};

export const getMockUserData = () => mockUserData;

export const clearMockUserData = () => {
  mockUserData = null;
};
