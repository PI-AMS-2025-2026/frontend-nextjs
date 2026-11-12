# Frontend — Projeto Integrador (Fatec Itu)

Frontend em [Next.js](https://nextjs.org) 16 (App Router, React 19), TypeScript,
Tailwind CSS 4 e componentes [shadcn/ui](https://ui.shadcn.com).
Consome a API REST (Spring Boot) na porta `8080`.

> Convenções de componentes: ver [`INSTRUCTIONS.md`](./INSTRUCTIONS.md).
> Camada de serviços da API: ver [`SERVICES.md`](./SERVICES.md).

## Requisitos

- Node.js **22 LTS** (o Next 16 exige Node >= 20.9)
- npm (o repositório usa `package-lock.json`)

## Desenvolvimento local (sem Docker)

```bash
npm ci
npm run dev
```

Crie um `.env.local` com a URL da API:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (saída `standalone`) |
| `npm start` | Executa o build de produção |
| `npm run lint` | ESLint (o `next lint` foi removido no Next 16) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Testes unitários/de componente com Vitest |
| `npm run test:coverage` | Testes com relatório de cobertura |

## Executando com Docker

O `docker-compose.yml` sobe três serviços: `db` (Postgres), `backend`
(imagem já publicada no ghcr.io) e `frontend` (construído localmente).
Assim não é necessário ter Java/Maven na máquina.

### 1. Autenticar no ghcr.io

A imagem do backend é **privada**. É preciso um PAT do GitHub com o escopo
`read:packages`:

```bash
echo "<SEU_PAT>" | docker login ghcr.io -u <seu-usuario-github> --password-stdin
```

### 2. Configurar as variáveis

```bash
cp .env.example .env
# edite o .env e substitua todos os valores CHANGE_ME
```

O `.env` é ignorado pelo Git — nunca versione segredos.

### 3. Subir o ambiente

```bash
docker compose up -d --build
```

Verificação:

```bash
curl -f http://localhost:3000/api/health      # {"status":"ok"}
curl -f http://localhost:8080/actuator/health
docker compose ps                             # todos os serviços "healthy"
```

Para derrubar (e apagar o volume do banco):

```bash
docker compose down -v
```

### Sobre a `NEXT_PUBLIC_API_URL`

Variáveis `NEXT_PUBLIC_*` são **embutidas no bundle em tempo de build**, não
lidas em tempo de execução. Por isso:

- a imagem do frontend é **específica por ambiente/branch**;
- a URL entra como `--build-arg NEXT_PUBLIC_API_URL=...`;
- ao alterá-la é obrigatório reconstruir a imagem:

```bash
docker compose build frontend && docker compose up -d frontend
```

Build da imagem sem o compose:

```bash
docker build --build-arg NEXT_PUBLIC_API_URL=http://localhost:8080 -t frontend:test .
docker run --rm -p 3000:3000 frontend:test
```

A imagem é multi-stage, roda como usuário **não-root** (uid 1001) e tem
`HEALTHCHECK` apontando para `/api/health`.

## Health check

`GET /api/health` → `200 {"status":"ok"}`.

É uma rota pública (não interceptada pelo guard de rotas em `src/proxy.ts`) e
nunca cacheada. É usada pelo `HEALTHCHECK` do Docker, pelo compose e pelos
orquestradores do repositório de infraestrutura.

## CI/CD

Dois workflows em `.github/workflows/`:

### `ci-tests.yml`

Roda em `pull_request` para `dev`, `staging` e `main`, e é reutilizável
(`workflow_call`). Jobs paralelos: `lint`, `typecheck`, `unit-tests`
(com cobertura publicada como artefato) e `build-check`.

O push em `dev`/`staging`/`main` **não** dispara este workflow diretamente —
ele é executado através do `build-release-images`, evitando execução duplicada.

### `build-release-images.yml`

Roda em push para `dev`, `staging`, `main` e em tags `v*.*.*`. Reutiliza o
`ci-tests` e só publica a imagem no ghcr.io se tudo passar.

Imagem: `ghcr.io/<owner>/<repo>` (em minúsculas). Tags publicadas:

| Tag | Quando | Mutável? |
| --- | --- | --- |
| `sha-<7 chars>` | sempre (usada nos deploys) | não |
| `dev` / `staging` / `main` | push na branch correspondente | sim |
| `X.Y.Z` e `X.Y` | tag git `vX.Y.Z` | sim (`X.Y`) |
| `latest` | somente a partir de `main` | sim |

Somente na branch `dev` o job `notify-infra` envia um `repository_dispatch`
ao repositório de infraestrutura, com `event_type: image-published` e
`client_payload: { service: "frontend", tag, sha, branch }`.
Os deploys de **staging** e **produção** são manuais, via `workflow_dispatch`
no repositório de infraestrutura, informando a tag da imagem.

> **O deploy não é feito neste repositório.** Ele é responsabilidade exclusiva
> do repositório de infraestrutura.

### Secrets e Variables necessários

Configurar em *Settings → Secrets and variables → Actions*:

**Secrets**

| Nome | Descrição |
| --- | --- |
| `INFRA_DISPATCH_TOKEN` | Token para disparar `repository_dispatch` no repositório de infraestrutura. Precisa de permissão de escrita em *Contents* (fine-grained PAT com `Contents: write`) ou ser um GitHub App com essa permissão. |

> O `GITHUB_TOKEN` usado no login do ghcr.io é fornecido automaticamente pelo
> GitHub Actions — não precisa ser criado.

**Variables**

| Nome | Exemplo |
| --- | --- |
| `INFRA_REPOSITORY` | `owner/repo-de-infra` |
| `NEXT_PUBLIC_API_URL_DEV` | `https://api-dev.exemplo.com` |
| `NEXT_PUBLIC_API_URL_STAGING` | `https://api-staging.exemplo.com` |
| `NEXT_PUBLIC_API_URL_PRODUCTION` | `https://api.exemplo.com` |

Se a variable do ambiente correspondente estiver vazia, o workflow falha com
mensagem explícita, em vez de publicar uma imagem apontando para a URL errada.

## Testes

Testes unitários e de componente com [Vitest](https://vitest.dev) +
`@testing-library/react` em ambiente `jsdom`.

```bash
npm test                 # modo watch
npm test -- --run        # execução única (usada no CI)
npm run test:coverage
```

Os arquivos de teste ficam ao lado do código, em `__tests__/*.test.tsx`.

### E2E está fora do escopo desta fase

Testes end-to-end (Playwright/Cypress) **não** foram incluídos porque:

- o backend não está disponível no CI (a imagem é privada e exige banco);
- várias telas ainda usam dados mockados (ex.:
  `src/app/coordenador/listagens/sala/mock.ts`), então os fluxos reais ainda
  não são estáveis o suficiente para serem asseverados.

Deve ser reavaliado quando a integração com a API estiver concluída.

## Branches

| Branch | Ambiente |
| --- | --- |
| `main` | produção |
| `staging` | homologação |
| `dev` | desenvolvimento |
