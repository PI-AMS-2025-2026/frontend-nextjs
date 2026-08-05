# Horários - Tela de Cadastro (Fatec)

Tela de gerenciamento de Horários desenvolvida em **Next.js** (App Router,
React + TypeScript), reproduzindo o protótipo fornecido: listagem, pesquisa
em tempo real, filtros, cadastro, edição, exclusão (com confirmação) e
modais de feedback de sucesso.

> Apenas o **conteúdo** da tela foi implementado, conforme solicitado — a
> navbar e o menu lateral não fazem parte deste componente e devem ser
> desenvolvidos/integrados separadamente (basta renderizar `<Horarios />`
> dentro do layout que já contém a navbar).

## Como rodar

```bash
npm install
npm run dev   # http://localhost:3000
```

## Estrutura

```
src/
├── models/
│   └── horario.ts                 # Interface Horario + tipo de payload
├── services/
│   └── horarioService.ts          # CRUD (mock em memória, pronto p/ trocar por fetch/API)
├── components/
│   ├── Modal/                     # Modal base reutilizável (overlay + card)
│   ├── SuccessModal/               # Modal de feedback de sucesso (auto-close)
│   ├── ConfirmModal/                # Modal de confirmação (usado na exclusão)
│   ├── HorarioFormModal/            # Modal de Cadastro/Edição (mesmo form para os dois)
│   ├── Pagination/                  # Paginação reutilizável
│   └── Horarios/                    # Tela principal (tabela, pesquisa, filtros)
└── app/
    ├── layout.tsx
    ├── globals.css                  # Tokens de design (cores, radius, fontes)
    └── page.tsx                     # Renderiza <Horarios />
```

## Funcionalidades implementadas

- **Listagem** com colunas Início, Fim, Duração e Ações.
- **Pesquisa em tempo real** por hora início e hora fim.
- **Filtros** por Horário Início / Horário Fim (inputs `type="time"`) + botão "Limpar filtros",
  funcionando em conjunto com a pesquisa.
- **Cadastro** via modal, com Hora Início/Fim (obrigatórios) e Duração (calculada
  automaticamente e somente leitura).
- **Edição** reaproveitando o mesmo modal/form, pré-preenchido com os dados do horário.
- **Exclusão individual** (ícone da linha) e **exclusão em lote** — marque as caixas de
  seleção das linhas (ou o checkbox do cabeçalho para marcar todos da página atual) e uma
  barra de ação aparece com o total selecionado e o botão "Excluir selecionados". A seleção
  é mantida mesmo ao trocar de página, então dá pra selecionar itens de páginas diferentes
  antes de excluir. Ambos os fluxos passam pelo mesmo modal de confirmação.
- **Modais de sucesso** ("Horário cadastrado/editado/excluído com sucesso!") que fecham
  automaticamente após 2 segundos e atualizam a listagem.
- **Regras de negócio**: campos obrigatórios, hora fim > hora início, e bloqueio de
  horários duplicados (mesmo início e fim) — validado em `horarioService`.
- **Paginação** completa: itens por página, primeira/última página, anterior/próxima,
  página atual e "Mostrando X a Y de Z registros".

## Sobre a persistência do mock

`src/services/horarioService.ts` guarda os dados também no `localStorage` do
navegador (chave `horarios:mock-data`). Isso é só para o mock não perder as
alterações a cada F5 durante os testes — quando a API real entrar, essa parte
de `localStorage` deixa de ser necessária (o backend passa a ser a fonte da
verdade) e pode ser removida.

## Integração futura com API

`src/services/horarioService.ts` já está preparado: os comentários em cada função
(`listar`, `criar`, `editar`, `excluir`) mostram exatamente qual chamada `fetch`
substituir (GET/POST/PUT/DELETE) para o endpoint real (ex: `/api/horarios`),
mantendo as mesmas assinaturas (`Promise<Horario[]>`, `Promise<Horario>`, etc.)
usadas pelos componentes — ou seja, basta trocar a implementação interna do
serviço, sem alterar a tela.
