export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export class SessionExpiredError extends ApiError {
  isSessionExpired: true = true;

  constructor(message: string, status: number, data?: unknown) {
    super(message, status, data);
    this.name = "SessionExpiredError";
  }
}

export type ApiResult<T> = {
  data: T | null;
  error: string | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const stringifyValue = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((entry) => stringifyValue(entry)).join(", ");
  }
  return "";
};

const extractErrorMessage = (data: unknown, fallback: string): string => {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (!isRecord(data)) return fallback;

  const directMessage =
    (typeof data.detail === "string" && data.detail) ||
    (typeof data.error === "string" && data.error) ||
    (typeof data.message === "string" && data.message);
  if (directMessage) return directMessage;

  const entries = Object.entries(data)
    .map(([field, value]) => {
      const text = stringifyValue(value);
      return text ? `${field}: ${text}` : "";
    })
    .filter(Boolean);

  return entries.length > 0 ? entries.join(". ") : fallback;
};

export const isApiError = (error: unknown): error is ApiError =>
  error instanceof ApiError;

export const isSessionExpiredError = (
  error: unknown
): error is SessionExpiredError =>
  error instanceof SessionExpiredError;

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (isApiError(error)) return error.message || fallback;
  if (error instanceof Error) return error.message || fallback;
  return fallback;
};

/**
 * Helper to handle session expiry errors by redirecting to login
 * Returns true if error was a session expiry (and redirect was triggered)
 */
export const handleSessionExpiry = (
  error: unknown,
  router: { push: (path: string) => void }
): boolean => {
  if (isSessionExpiredError(error)) {
    console.warn("[Session] Session expired, redirecting to login");

    // Get current path for return URL
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "";
    const nextParam = currentPath && currentPath !== "/login-talent"
      ? `?next=${encodeURIComponent(currentPath)}`
      : "";

    router.push(`/login-talent${nextParam}`);
    return true;
  }
  return false;
};

/**
 * Check if an error message indicates authentication failure
 */
const isAuthenticationError = (message: string, status: number): boolean => {
  if (status !== 401) return false;

  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes("authentication") ||
    lowerMessage.includes("credentials") ||
    lowerMessage.includes("not provided") ||
    lowerMessage.includes("unauthorized") ||
    lowerMessage.includes("session expired") ||
    lowerMessage.includes("login required")
  );
};

const parseJsonResponse = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  return response.json().catch(() => null);
};

export async function apiRequest<T>(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  const hasBody = init.body !== undefined && init.body !== null;
  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;

  if (hasBody && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(input, {
    ...init,
    credentials: init.credentials ?? "include",
    headers,
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const message = extractErrorMessage(
      data,
      response.statusText || "Request failed"
    );

    // Check if this is a session expiry error (401 with auth-related message)
    if (isAuthenticationError(message, response.status)) {
      throw new SessionExpiredError(message, response.status, data);
    }

    throw new ApiError(message, response.status, data);
  }

  return data as T;
}
