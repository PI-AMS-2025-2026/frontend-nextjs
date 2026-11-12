# syntax=docker/dockerfile:1.7
# Imagem de produção do frontend (Next.js 16 em modo standalone).
# Multi-stage para manter a imagem final enxuta e sem dependências de build.

# ---------------------------------------------------------------------------
# Stage 1 - deps: instala as dependências com cache do npm
# ---------------------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app

# Copiar apenas os manifests permite reaproveitar esta camada enquanto
# o package-lock.json não mudar.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ---------------------------------------------------------------------------
# Stage 2 - builder: compila a aplicação
# ---------------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variáveis NEXT_PUBLIC_* são embutidas no bundle em tempo de build.
# Por isso a imagem é específica por ambiente (dev/staging/produção).
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3 - runner: apenas o necessário para executar
# ---------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Usuário sem privilégios (o node:alpine já traz uid/gid 1000 para "node";
# criamos 1001 para alinhar com a convenção usada no repositório de infra).
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs

# A saída standalone já inclui os node_modules estritamente necessários.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

# wget vem do busybox incluído no alpine.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
