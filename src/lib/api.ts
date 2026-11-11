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

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

function buildUrl(endpoint: string, params?: object) {
  const url = new URL(
    endpoint,
    API_URL.endsWith("/") ? API_URL : `${API_URL}/`,
  );

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(queryParameter(endpoint, key), String(value));
      }
    });
  }

  return url.toString();
}

const QUERY_ALIASES: Record<string, Record<string, string>> = {
  "/turmas": { curso: "id_curso" },
  "/salas": { tipo_sala: "id_tipo_sala" },
  "/recursos": { tipo_recurso: "id_tipo_recurso" },
  "/recursos-salas": { salaId: "id_sala", recursoId: "id_recurso", sala_id: "id_sala", recurso_id: "id_recurso" },
  "/quadros-horarios": { curso: "id_curso", periodo_atividade_quadro: "id_periodo_atividade_quadro" },
  "/professores-disciplinas": { usuario: "id_professor", disciplina: "id_disciplina" },
  "/periodos-atividade-quadro": { dataInicio: "data_inicio", dataFim: "data_fim" },
  "/disponibilidades-professores": { professor: "id_professor", bloco_horario: "id_bloco_horario" },
  "/disciplinas": { curso: "id_curso", tipo_sala: "id_tipo_sala" },
  "/alocacoes": { turma: "id_turma", disciplina: "id_disciplina", sala: "id_sala", usuario: "id_usuario", horario: "id_bloco_horario", quadro_horario: "id_quadro_horario" },
  "/historicos-versoes-alocacoes": { alocacao: "id_alocacao", usuario: "id_usuario" },
};

function queryParameter(endpoint: string, key: string) {
  const route = endpoint.split("?")[0].replace(/\/$/, "");
  const collection = route.replace(/\/\d+$/, "");
  return QUERY_ALIASES[collection]?.[key] ?? key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function mapKeys(value: unknown, convert: (key: string) => string): unknown {
  if (Array.isArray(value)) return value.map((item) => mapKeys(item, convert));
  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [convert(key), mapKeys(item, convert)]));
  }
  return value;
}

const toApiKey = (key: string) => key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
const fromApiKey = (key: string) => key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  if (response.ok && response.headers.get("content-type")?.includes("application/pdf")) return response.blob();

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
  params?: object,
  authenticated = true,
  isRetry = false,
  responseBlob = false,
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

  const data = response.ok && responseBlob ? await response.blob() : await parseResponse(response);

  if (!response.ok) {
    // Tenta renovar o token automaticamente se receber 401 em rota autenticada
    if (
      response.status === 401 &&
      authenticated &&
      !isRetry &&
      !endpoint.includes("/auth/")
    ) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const refreshRes = await fetch(buildUrl("/auth/refresh"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshRes.ok) {
            const tokenData = (await refreshRes.json()) as {
              access_token?: string;
              refresh_token?: string;
            };
            if (tokenData?.access_token) {
              localStorage.setItem("access_token", tokenData.access_token);
              if (tokenData.refresh_token) {
                localStorage.setItem("refresh_token", tokenData.refresh_token);
              }
              return request<T>(endpoint, options, params, authenticated, true, responseBlob);
            }
          }
        } catch {
          // Erro silencioso durante renovação
        }
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }

    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message?: unknown }).message)
        : `Erro na API (${response.status})`;

    throw new ApiError(message, response.status, data);
  }

  return mapKeys(data, fromApiKey) as T;
}

export const api = {
  getBlob(endpoint: string) {
    return request<Blob>(endpoint, { method: "GET" }, undefined, true, false, true);
  },
  get<T>(
    endpoint: string,
    params?: object,
    authenticated = true,
  ) {
    return request<T>(endpoint, { method: "GET" }, params, authenticated);
  },

  post<T>(endpoint: string, body?: unknown, authenticated = true) {
    return request<T>(
      endpoint,
      {
        method: "POST",
        body: body === undefined ? undefined : JSON.stringify(mapKeys(body, toApiKey)),
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
        body: body === undefined ? undefined : JSON.stringify(mapKeys(body, toApiKey)),
      },
      undefined,
      authenticated,
    );
  },

  delete<T = void>(endpoint: string, authenticated = true) {
    return request<T>(endpoint, { method: "DELETE" }, undefined, authenticated);
  },
};
