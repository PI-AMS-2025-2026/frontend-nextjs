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

# Variáveis NEXT_PUBLIC_* são embutidas no bundle em tempo de build. A imagem
# é ÚNICA para todos os ambientes: o bundle leva um placeholder FIXO, trocado
# pela URL real (variável API_URL) no docker-entrypoint.sh ao iniciar o
# container. O TLD .invalid nunca resolve, então o placeholder jamais aponta
# para um host. Não é um ARG de propósito: a URL não é configurável no build.
ENV NEXT_PUBLIC_API_URL=http://gini-api-placeholder.invalid
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

# Usuário sem privilégios dedicado (uid/gid 1001, convenção dos exemplos
# oficiais do Next.js; o node:alpine já usa 1000 para o usuário "node").
# O /app (criado pelo WORKDIR) também pertence ao nextjs: o entrypoint usa
# `sed -i`, que grava um arquivo temporário no diretório de /app/server.js.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs \
  && chown nextjs:nodejs /app

# A saída standalone já inclui os node_modules estritamente necessários.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Troca o placeholder da URL da API em runtime (ver docker-entrypoint.sh).
COPY --chown=nextjs:nodejs --chmod=755 docker-entrypoint.sh ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000

# wget vem do busybox incluído no alpine.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
