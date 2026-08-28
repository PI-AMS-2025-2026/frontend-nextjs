const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function buildUrl(endpoint: string, params?: Record<string, unknown>) {
  const url = new URL(endpoint, API_URL.endsWith("/") ? API_URL : `${API_URL}/`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || undefined;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  params?: Record<string, unknown>,
  authenticated = true,
): Promise<T> {
  const token = authenticated ? getToken() : null;
  const headers = new Headers(options.headers);

 if (
  options.body &&
  !(options.body instanceof FormData) &&
  !headers.has("Content-Type")
) {
  headers.set("Content-Type", "application/json");
} 
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(endpoint, params), {
    ...options,
    headers,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message?: unknown }).message)
        : `Erro na API (${response.status})`;

    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export const api = {
  get<T>(endpoint: string, params?: Record<string, unknown>, authenticated = true) {
    return request<T>(endpoint, { method: "GET" }, params, authenticated);
  },

  post<T>(endpoint: string, body?: unknown, authenticated = true) {
    return request<T>(
      endpoint,
      {
        method: "POST",
        body: body === undefined ? undefined : JSON.stringify(body),
      },
      undefined,
      authenticated,
    );
  },

  put<T>(endpoint: string, body?: unknown, authenticated = true) {
    return request<T>(
      endpoint,
      {
        method: "PUT",
        body: body === undefined ? undefined : JSON.stringify(body),
      },
      undefined,
      authenticated,
    );
  },

  delete<T = void>(endpoint: string, authenticated = true) {
    return request<T>(endpoint, { method: "DELETE" }, undefined, authenticated);
  },
};
