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

O `docker-compose.yml` sobe quatro serviços: `db` (Postgres 17), `mailpit`
(caixa de entrada local do e-mail de recuperação de senha), `backend` (imagem
já publicada no ghcr.io) e `frontend` (construído localmente). Assim não é
necessário ter Java/Maven na máquina.

As variáveis do backend espelham o compose do `backend-java` e o do
repositório de infraestrutura: `FRONTEND_URL` (CORS e link do e-mail), SMTP
apontando para o Mailpit e `APP_ENVIRONMENT=dev`. Se o backend passar a exigir
uma variável nova, ela precisa ser adicionada aqui também.

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

O `.env` é ignorado pelo Git — nunca versione segredos. O `JWT_SECRET` precisa
ter 32+ caracteres (`openssl rand -hex 32`); o backend recusa subir sem isso.

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

E-mails enviados pelo backend (recuperação de senha) aparecem no Mailpit:
<http://localhost:8025>.

> **Atualizando de uma versão anterior do compose (Postgres 16):** o volume
> antigo não é compatível com o Postgres 17. Rode `docker compose down -v` uma
> vez antes de subir — os dados locais são recriados pelas migrations.

Para derrubar (e apagar o volume do banco):

```bash
docker compose down -v
```

### Sobre a `NEXT_PUBLIC_API_URL`

Variáveis `NEXT_PUBLIC_*` são **embutidas no bundle em tempo de build**, não
lidas em tempo de execução. Por isso:

- a imagem do frontend construída com a URL é **específica por ambiente/branch**
  (para uma imagem só, ver "URL da API em runtime" abaixo);
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

### URL da API em runtime (imagem única)

Além das imagens por ambiente, o CI publica uma **imagem única**, válida para
todos os ambientes (local, dev, staging, produção e AWS). A URL da API é
informada ao **iniciar** o container, pela variável `API_URL`.

Como funciona:

1. Sem `--build-arg NEXT_PUBLIC_API_URL`, o `Dockerfile` embute no bundle o
   placeholder fixo `http://gini-api-placeholder.invalid` (URL válida; o TLD
   `.invalid` nunca resolve).
2. O `docker-entrypoint.sh` valida a `API_URL` e troca o placeholder em
   `/app/server.js` e em `/app/.next` (chunks do navegador em `.next/static` e
   do SSR em `.next/server`) antes de executar `node server.js`.

Regras do `docker-entrypoint.sh`:

| Situação | Resultado |
| --- | --- |
| Imagem única + `API_URL` válida | troca o placeholder e sobe |
| Imagem única sem `API_URL` | `exit 1`: "API_URL não definida: esta imagem exige a URL da API em runtime" |
| `API_URL` inválida (qualquer imagem) | `exit 1` |
| Imagem antiga (URL embutida) sem `API_URL` | sobe normalmente, sem alterar nada |
| Imagem antiga com `API_URL` | sobe com a URL embutida e loga um aviso (`API_URL` é ignorada) |

Formato aceito para a `API_URL`: apenas esquema, host e porta opcional, **sem
barra final nem caminho**. Exemplos: `https://api.exemplo.com` e
`http://10.0.0.5:8081`.

> **Trocar a `API_URL` exige RECRIAR o container.** A substituição altera os
> arquivos do próprio container: um `docker restart` com a mesma URL funciona
> ("já configurado"), mas com outra URL o entrypoint falha e pede para
> recriar. O `docker compose up -d` recria o container sozinho quando o
> ambiente do serviço muda; para forçar, use
> `docker compose up -d --force-recreate frontend`. Pelo mesmo motivo, a
> imagem não funciona com sistema de arquivos somente leitura (`read_only`).

**Rótulo OCI.** A imagem única publicada pelo CI tem o rótulo
`br.fatec.gini.runtime-api-url=true`. As imagens por ambiente não têm esse
rótulo. Scripts de deploy podem verificar o rótulo antes de passar a
`API_URL`:

```bash
docker image inspect ghcr.io/pi-ams-2025-2026/frontend-nextjs:sha-a1b2c3d \
  --format '{{ index .Config.Labels "br.fatec.gini.runtime-api-url" }}'   # true
```

Teste manual:

```bash
docker build -t frontend:unica .     # sem build-arg = placeholder

# Sem API_URL: falha de propósito (exit 1)
docker run --rm frontend:unica

# Com API_URL: sobe e fica "healthy"
docker run -d --name fe -p 3000:3000 -e API_URL=http://10.0.0.5:8081 frontend:unica
docker logs fe        # [entrypoint] URL da API configurada em runtime (N arquivo(s) alterado(s)).

# O placeholder sumiu do bundle e a nova URL está nos chunks do navegador
docker exec fe sh -c 'grep -rlF gini-api-placeholder.invalid /app/.next /app/server.js | wc -l'   # 0
docker exec fe sh -c 'grep -rlF http://10.0.0.5:8081 /app/.next/static'

# URL inválida: exit 1
docker run --rm -e 'API_URL=http://a/;rm' frontend:unica

docker rm -f fe
```

O `docker-compose.yml` local continua construindo a imagem com a URL real
(`NEXT_PUBLIC_API_URL`), então o fluxo de desenvolvimento não muda.

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
| `sha-<7 chars>-<ambiente>` | sempre (usada nos deploys); ambiente = `dev`, `staging` ou `production` | não |
| `dev` / `staging` / `main` | push na branch correspondente | sim |
| `X.Y.Z` e `X.Y` | tag git `vX.Y.Z` | sim (`X.Y`) |
| `latest` | somente a partir de `main` | sim |
| `sha-<7 chars>` | sempre; **imagem única** (URL da API em runtime, rótulo `br.fatec.gini.runtime-api-url=true`) | não |

As tags da tabela acima, exceto `sha-<7 chars>`, apontam para as imagens por
ambiente. A imagem única é publicada pelo job `build-unified` e recebe
**somente** a tag `sha-<7 chars>`; ela é a mesma para todos os ambientes, por
isso não leva o sufixo. Quando todos os ambientes tiverem migrado para a
imagem única (FASE B), ela passa a receber também as tags `dev`, `staging`,
`main`, semver e `latest`, e o build por ambiente é removido.

Somente na branch `dev` o job `notify-infra` envia um `repository_dispatch`
ao repositório de infraestrutura, com `event_type: image-published` e
`client_payload: { service: "frontend", tag, sha, branch }`. A `tag` enviada
depende da variable `FRONTEND_DISPATCH_UNIFIED` (ver abaixo): por padrão é a
imagem por ambiente (`sha-<7>-dev`).
Os deploys de **staging** e **produção** são manuais, via `workflow_dispatch`
no repositório de infraestrutura, informando a tag da imagem.

> **Por que o ambiente está na tag imutável?** A URL da API é embutida no
> build, então cada ambiente tem sua própria imagem. Um mesmo commit pode ser
> buildado em `dev` e depois em `staging`/`main` (fast-forward ou rebase); com
> só `sha-<7>`, o segundo build sobrescreveria o primeiro com outra URL. No
> deploy manual, use a tag do ambiente certo (ex.: `sha-a1b2c3d-staging`).

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

| `FRONTEND_DISPATCH_UNIFIED` | `true` (opcional; padrão: ausente) |

Se a variable do ambiente correspondente estiver vazia, o workflow falha com
mensagem explícita, em vez de publicar uma imagem apontando para a URL errada.

**`FRONTEND_DISPATCH_UNIFIED`**: quando o valor é exatamente `true`, o
`notify-infra` envia ao repositório de infraestrutura a tag da **imagem única**
(`sha-<7>`). Com qualquer outro valor, ou ausente, envia a tag antiga
(`sha-<7>-dev`), e o payload fica idêntico ao de antes.

> **Ordem de migração:** só mude para `true` **depois** que o repositório de
> infraestrutura (`banco-infra`) estiver pronto para a imagem única **e** o
> `.env` do ambiente `dev` no servidor tiver a `API_URL`. Caso contrário, o
> deploy automático de `dev` sobe um container que falha ao iniciar
> ("API_URL não definida").

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
