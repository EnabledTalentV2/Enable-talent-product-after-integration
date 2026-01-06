import type { UserData } from "@/lib/types/user";

type StoredUser = {
  email: string;
  password: string;
  userData: UserData;
  createdAt: string;
};

const USERS_KEY = "et_users";
const CURRENT_USER_KEY = "et_current_user";
const PENDING_SIGNUP_KEY = "et_pending_signup";

const isBrowser = () => typeof window !== "undefined";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const readUsers = (): StoredUser[] => {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(USERS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((user) => user && typeof user.email === "string" && typeof user.password === "string");
  } catch {
    return [];
  }
};

const writeUsers = (users: StoredUser[]) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const saveUser = (user: { email: string; password: string; userData: UserData }) => {
  const users = readUsers();
  const emailKey = normalizeEmail(user.email);
  const nextUser: StoredUser = {
    email: user.email.trim(),
    password: user.password,
    userData: user.userData,
    createdAt: new Date().toISOString(),
  };
  const existingIndex = users.findIndex((entry) => normalizeEmail(entry.email) === emailKey);

  if (existingIndex >= 0) {
    users[existingIndex] = { ...users[existingIndex], ...nextUser };
  } else {
    users.push(nextUser);
  }

  writeUsers(users);
  return nextUser;
};

export const getUserByEmail = (email: string) => {
  const emailKey = normalizeEmail(email);
  const users = readUsers();
  return users.find((entry) => normalizeEmail(entry.email) === emailKey) ?? null;
};

export const setCurrentUser = (email: string) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(CURRENT_USER_KEY, email);
};

export const getCurrentUser = () => {
  if (!isBrowser()) return null;
  const email = window.localStorage.getItem(CURRENT_USER_KEY);
  if (!email) return null;
  return getUserByEmail(email);
};

export const clearCurrentUser = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(CURRENT_USER_KEY);
};

export const setPendingSignup = (payload: { email: string; password: string }) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(
    PENDING_SIGNUP_KEY,
    JSON.stringify({ email: payload.email.trim(), password: payload.password })
  );
};

export const getPendingSignup = () => {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(PENDING_SIGNUP_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { email?: string; password?: string };
    if (!parsed.email || !parsed.password) return null;
    return { email: parsed.email, password: parsed.password };
  } catch {
    return null;
  }
};

export const clearPendingSignup = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(PENDING_SIGNUP_KEY);
};

export const hasStoredUsers = () => {
  return readUsers().length > 0;
};
