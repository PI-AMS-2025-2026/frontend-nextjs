import type { LoginResponse } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const USER_UPDATED_EVENT = "auth:user-updated";
const SESSION_EXPIRED_EVENT = "auth:session-expired";

export class SessionExpiredError extends Error {
  constructor(message = "Sua sessão expirou. Faça login novamente.") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

export class SessionRefreshUnavailableError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "SessionRefreshUnavailableError";
  }
}

let refreshInFlight: Promise<LoginResponse> | null = null;
let refreshGeneration = 0;
let expirationHandled = false;
let expirationInFlight: Promise<void> | null = null;

function apiUrl(path: string) {
  return new URL(path, API_URL.endsWith("/") ? API_URL : `${API_URL}/`).toString();
}

function fromApiKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(fromApiKeys);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase()),
      fromApiKeys(item),
    ]),
  );
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("access_token");
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("refresh_token");
}

function publishUserUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(USER_UPDATED_EVENT));
  }
}

export function storeSession(response: LoginResponse) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("access_token", response.accessToken);
  window.localStorage.setItem("refresh_token", response.refreshToken);
  if (response.usuario) {
    window.localStorage.setItem("usuario", JSON.stringify(response.usuario));
  }
  expirationHandled = false;
  expirationInFlight = null;
  publishUserUpdated();
}

export function invalidatePendingRefresh() {
  refreshGeneration += 1;
}

export function clearSession() {
  if (typeof window === "undefined") return;
  invalidatePendingRefresh();
  window.localStorage.removeItem("access_token");
  window.localStorage.removeItem("refresh_token");
  window.localStorage.removeItem("usuario");
  window.document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  publishUserUpdated();
}

async function performRefresh(refreshToken: string, generation: number): Promise<LoginResponse> {
  let response: Response;
  try {
    response = await fetch(apiUrl("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch {
    throw new SessionRefreshUnavailableError("Não foi possível conectar ao servidor para renovar a sessão.");
  }

  if (response.status === 401) throw new SessionExpiredError();

  if (!response.ok) {
    const data = await response.json().catch(() => null) as { message?: unknown } | null;
    const message = typeof data?.message === "string"
      ? data.message
      : `Não foi possível renovar a sessão (${response.status}).`;
    throw new SessionRefreshUnavailableError(message, response.status);
  }

  let responseData: unknown;
  try {
    responseData = await response.json();
  } catch {
    throw new SessionExpiredError("O servidor retornou uma sessão inválida. Entre novamente.");
  }

  const data = fromApiKeys(responseData) as Partial<LoginResponse> | null;
  if (!data || typeof data.accessToken !== "string" || !data.accessToken ||
      typeof data.refreshToken !== "string" || !data.refreshToken) {
    throw new SessionExpiredError("O servidor retornou uma sessão inválida. Entre novamente.");
  }

  if (generation !== refreshGeneration || getRefreshToken() !== refreshToken) {
    throw new SessionExpiredError();
  }

  const renewed = data as LoginResponse;
  storeSession(renewed);
  return renewed;
}

export function refreshSession(): Promise<LoginResponse> {
  if (refreshInFlight) return refreshInFlight;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return Promise.reject(new SessionExpiredError());

  const generation = refreshGeneration;
  const pending = performRefresh(refreshToken, generation);
  refreshInFlight = pending;
  void pending.finally(() => {
    if (refreshInFlight === pending) refreshInFlight = null;
  }).catch(() => undefined);
  return pending;
}

export function expireSession(): Promise<void> {
  if (expirationInFlight) return expirationInFlight;
  if (expirationHandled) return Promise.resolve();
  expirationHandled = true;

  const refreshToken = getRefreshToken();
  clearSession();

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }

  expirationInFlight = refreshToken
    ? fetch(apiUrl("/auth/logout"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }).then(() => undefined).catch(() => undefined)
    : Promise.resolve();
  return expirationInFlight;
}

export const authSessionEvents = {
  userUpdated: USER_UPDATED_EVENT,
  sessionExpired: SESSION_EXPIRED_EVENT,
};
