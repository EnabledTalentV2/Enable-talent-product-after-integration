export type ApiError = {
  message: string;
  status: number;
  data?: unknown;
};

export type ApiResult<T> = {
  data: T | null;
  error: string | null;
};

const CSRF_COOKIE_NAME = "csrftoken";
let csrfPromise: Promise<void> | null = null;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getCookieValue = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const entries = document.cookie.split(";").map((entry) => entry.trim());
  for (const entry of entries) {
    if (!entry) continue;
    const [key, ...rest] = entry.split("=");
    if (key === name) {
      return rest.join("=") ? decodeURIComponent(rest.join("=")) : "";
    }
  }
  return null;
};

const isWriteMethod = (method?: string) =>
  ["POST", "PUT", "PATCH", "DELETE"].includes(
    (method || "GET").toUpperCase()
  );

const ensureCsrfToken = async (): Promise<void> => {
  if (typeof window === "undefined") return;
  if (getCookieValue(CSRF_COOKIE_NAME)) return;
  if (!csrfPromise) {
    csrfPromise = fetch("/api/auth/csrf", {
      method: "GET",
      credentials: "include",
    })
      .then(() => undefined)
      .finally(() => {
        csrfPromise = null;
      });
  }
  await csrfPromise;
};

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
  isRecord(error) &&
  typeof error.message === "string" &&
  typeof error.status === "number";

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (isApiError(error)) return error.message || fallback;
  if (error instanceof Error) return error.message || fallback;
  return fallback;
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

  const method = (init.method || "GET").toUpperCase();
  if (isWriteMethod(method)) {
    await ensureCsrfToken();
    const csrfToken = getCookieValue(CSRF_COOKIE_NAME);
    if (csrfToken && !headers.has("X-CSRFToken")) {
      headers.set("X-CSRFToken", csrfToken);
    }
  }

  const response = await fetch(input, {
    ...init,
    credentials: init.credentials ?? "include",
    headers,
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw {
      status: response.status,
      message: extractErrorMessage(data, response.statusText || "Request failed"),
      data,
    } satisfies ApiError;
  }

  return data as T;
}
