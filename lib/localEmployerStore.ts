import type { EmployerData } from "@/lib/employerDataStore";

type StoredEmployer = {
  email: string;
  password: string;
  employerData: EmployerData;
  createdAt: string;
  fullName?: string;
  employerName?: string;
};

type PendingEmployerSignup = {
  email: string;
  password: string;
  fullName?: string;
  employerName?: string;
};

const EMPLOYERS_KEY = "et_employers";
const CURRENT_EMPLOYER_KEY = "et_current_employer";
const PENDING_EMPLOYER_SIGNUP_KEY = "et_pending_employer_signup";

const isBrowser = () => typeof window !== "undefined";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const readEmployers = (): StoredEmployer[] => {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(EMPLOYERS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry) =>
        entry &&
        typeof entry.email === "string" &&
        typeof entry.password === "string"
    );
  } catch {
    return [];
  }
};

const writeEmployers = (employers: StoredEmployer[]) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(EMPLOYERS_KEY, JSON.stringify(employers));
};

export const saveEmployer = (employer: {
  email: string;
  password: string;
  employerData: EmployerData;
  fullName?: string;
  employerName?: string;
}) => {
  const employers = readEmployers();
  const emailKey = normalizeEmail(employer.email);
  const nextEmployer: StoredEmployer = {
    email: employer.email.trim(),
    password: employer.password,
    employerData: employer.employerData,
    createdAt: new Date().toISOString(),
    fullName: employer.fullName?.trim(),
    employerName: employer.employerName?.trim(),
  };
  const existingIndex = employers.findIndex(
    (entry) => normalizeEmail(entry.email) === emailKey
  );

  if (existingIndex >= 0) {
    employers[existingIndex] = { ...employers[existingIndex], ...nextEmployer };
  } else {
    employers.push(nextEmployer);
  }

  writeEmployers(employers);
  return nextEmployer;
};

export const getEmployerByEmail = (email: string) => {
  const emailKey = normalizeEmail(email);
  const employers = readEmployers();
  return employers.find((entry) => normalizeEmail(entry.email) === emailKey) ?? null;
};

export const setCurrentEmployer = (email: string) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(CURRENT_EMPLOYER_KEY, normalizeEmail(email));
};

export const getCurrentEmployer = () => {
  if (!isBrowser()) return null;
  const email = window.localStorage.getItem(CURRENT_EMPLOYER_KEY);
  if (!email) return null;
  return getEmployerByEmail(email);
};

export const clearCurrentEmployer = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(CURRENT_EMPLOYER_KEY);
};

export const setPendingEmployerSignup = (payload: PendingEmployerSignup) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(
    PENDING_EMPLOYER_SIGNUP_KEY,
    JSON.stringify({
      email: payload.email.trim(),
      password: payload.password,
      fullName: payload.fullName?.trim(),
      employerName: payload.employerName?.trim(),
    })
  );
};

export const getPendingEmployerSignup = () => {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(PENDING_EMPLOYER_SIGNUP_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingEmployerSignup;
    if (!parsed.email || !parsed.password) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const clearPendingEmployerSignup = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(PENDING_EMPLOYER_SIGNUP_KEY);
};

export const hasStoredEmployers = () => {
  return readEmployers().length > 0;
};
