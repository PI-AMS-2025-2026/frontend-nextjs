// Ambientes reconhecidos pela variável de runtime APP_ENVIRONMENT.
export const APP_ENVIRONMENTS = ["dev", "staging", "production"] as const;

export type AppEnvironment = (typeof APP_ENVIRONMENTS)[number];

// Retorna o ambiente se o valor for um dos aceitos; caso contrário, null.
export function parseAppEnvironment(value: unknown): AppEnvironment | null {
  return typeof value === "string" &&
    (APP_ENVIRONMENTS as readonly string[]).includes(value)
    ? (value as AppEnvironment)
    : null;
}
