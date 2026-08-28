# Serviços da API

A camada de serviços foi criada a partir do OpenAPI em `http://localhost:8080/v3/api-docs`.

## Configuração

Crie `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

O cliente HTTP em `src/lib/api.ts` adiciona automaticamente `Authorization: Bearer <token>` quando existe `access_token` no `localStorage`.

## Organização

- `src/lib/api.ts` — cliente HTTP, query params, tratamento de erros e token.
- `src/types/api.ts` — DTOs, responses, paginação e enums da documentação.
- `src/services/*.service.ts` — serviços separados por recurso.
- `src/services/index.ts` — exportação central dos serviços.

## Exemplo

```ts
import { cursosService } from "@/services";

const response = await cursosService.listar({
  status: "ATIVO",
  page: 0,
  size: 10,
});

console.log(response.content);
```
