"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Modal } from "@/components/ui/modal";
import {
  DateInput,
  SearchInput,
  PasswordInput,
  Input,
} from "@/components/ui/input";
import { Dropdown } from "@/components/ui/dropdown";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Wrench, Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/table";
import { Tooltip } from "@/components/ui/tooltip";
import { Toggle } from "@/components/ui/toggle";
import { TableFilters } from "@/components/ui/tablefilters";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";

interface Room {
  codigo: string;
  capacidade: number;
  tipo: string;
}

const rooms: Room[] = [
  {
    codigo: "Sala 01",
    capacidade: 40,
    tipo: "Informática",
  },
  {
    codigo: "Sala 02",
    capacidade: 40,
    tipo: "Sala de aula",
  },
  {
    codigo: "Sala 03",
    capacidade: 40,
    tipo: "Informática",
  },
  {
    codigo: "Sala 04",
    capacidade: 40,
    tipo: "Sala de aula",
  },
  {
    codigo: "Sala 05",
    capacidade: 40,
    tipo: "Informática",
  },
  {
    codigo: "Sala 06",
    capacidade: 40,
    tipo: "Sala de aula",
  },
];

export default function Home() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState("");
  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-3xl font-semibold">Showcase dos componentes</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Aqui está uma visão geral de todos os componentes UI disponíveis.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Botões e inputs</CardTitle>
              <CardDescription>
                Exemplos básicos de ação e formulário.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" size="large">
                  Primary
                </Button>
                <Button variant="secondary" size="medium">
                  Secondary
                </Button>
                <Button variant="danger" size="small">
                  Danger
                </Button>
              </div>
              <div className="space-y-2">
                <DateInput label="Data de nascimento" showLabel />
                <PasswordInput
                  label="Senha"
                  showLabel
                  placeholder="Digite sua senha"
                />
                <Input label="Nome" showLabel placeholder="Digite algo..." />
                <SearchInput placeholder="Pesquisar..." />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="ghost" size="small">
                Cancelar
              </Button>
              <Button variant="primary" size="small">
                Salvar
              </Button>
            </CardFooter>
          </Card>

          <Card className="overflow-visible">
            <CardHeader>
              <CardTitle>Seleção</CardTitle>
              <CardDescription>
                Checkbox, rádio e select nativo.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <label className="flex items-center gap-2">
                <Checkbox defaultChecked />
                <span className="text-sm">Aceito os termos</span>
              </label>

              <RadioGroup defaultValue="opcao1">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="opcao1" />
                  <span>Opção 1</span>
                </div>

                <div className="flex items-center gap-2">
                  <RadioGroupItem value="opcao2" />
                  <span>Opção 2</span>
                </div>
              </RadioGroup>

              <Toggle label="Notificações" showLabel />

              <Toggle />

              <Toggle label="Modo escuro" showLabel defaultChecked />

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#17264D]">
                  Dropdown
                </label>

                <Dropdown
                  options={[
                    { label: "Opção A", value: "a" },
                    { label: "Opção B", value: "b" },
                    { label: "Opção C", value: "c" },
                  ]}
                  placeholder="Selecione uma opção"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#17264D]">
                  Select
                </label>

                <Select
                  options={[
                    { label: "Opção A", value: "a" },
                    { label: "Opção B", value: "b" },
                    { label: "Opção C", value: "c" },
                  ]}
                  value={selectedOption}
                  onChange={setSelectedOption}
                  placeholder="Selecione uma opção"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Accordion</CardTitle>
              <CardDescription>Conteúdo em blocos expansíveis.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    Qual é a melhor época para viajar?
                  </AccordionTrigger>

                  <AccordionContent>
                    A melhor época depende do destino e do clima que você
                    prefere. Pesquisar as condições locais antes da viagem pode
                    ajudar no planejamento.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    Quanto tempo leva para aprender um idioma?
                  </AccordionTrigger>

                  <AccordionContent>
                    O tempo varia de acordo com a frequência de estudo, contato
                    com o idioma e familiaridade com a língua. A prática
                    constante costuma trazer melhores resultados.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    Como cuidar de uma planta dentro de casa?
                  </AccordionTrigger>

                  <AccordionContent>
                    Verifique a quantidade de luz necessária para a espécie,
                    mantenha uma rotina adequada de rega e evite deixar água
                    acumulada no recipiente.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tooltip</CardTitle>
              <CardDescription>Informações contextuais.</CardDescription>
            </CardHeader>
            <CardContent className="flex h-full flex-wrap justify-center items-center gap-4">
              <Tooltip content="Configurações" side="left" variant="secondary">
                <Button variant="primary" size="small">
                  Config
                </Button>
              </Tooltip>

              <Tooltip content="Editar usuário">
                <Button variant="secondary" size="small">
                  Editar
                </Button>
              </Tooltip>

              <Tooltip
                content="Excluir este item"
                side="bottom"
                variant="primary"
              >
                <Button variant="danger" size="small">
                  Excluir
                </Button>
              </Tooltip>

              <Tooltip
                content="Informações adicionais"
                side="right"
                variant="secondary"
              >
                <Button variant="primary" size="small">
                  Mais info
                </Button>
              </Tooltip>
            </CardContent>
          </Card>
        </section>

        <section className="grid w-full gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Modal</CardTitle>
              <CardDescription>Modal simples com ação.</CardDescription>
            </CardHeader>

            <CardContent className="flex w-full flex-1 items-center justify-center">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {/* Modal personalizado */}
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => setModalOpen(true)}
                >
                  Modal
                </Button>

                {/* Modal de criação */}
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setCreateModalOpen(true)}
                >
                  Criar
                </Button>

                {/* Modal de edição */}
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => setEditModalOpen(true)}
                >
                  Editar
                </Button>

                {/* Modal de exclusão */}
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => setDeleteModalOpen(true)}
                >
                  Excluir
                </Button>

                {/* Modal de erro */}
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setErrorModalOpen(true)}
                >
                  Erro
                </Button>
              </div>

              {/* ==================== */}
              {/* MODAL PERSONALIZADO */}
              {/* ==================== */}

              <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <h2 className="text text-xl font-semibold">Olá!</h2>

                <p className="mt-2 text text-sm text-[#17264D]/70">
                  Este é um exemplo de modal usando o componente reutilizável.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => setModalOpen(false)}
                  >
                    Fechar
                  </Button>

                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => setModalOpen(false)}
                  >
                    Confirmar
                  </Button>
                </div>
              </Modal>

              {/* ==================== */}
              {/* MODAL DE CRIAÇÃO */}
              {/* ==================== */}

              <Modal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                type="success"
                message="Usuário criado com sucesso!"
              />

              {/* ==================== */}
              {/* MODAL DE EDIÇÃO */}
              {/* ==================== */}

              <Modal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                type="success"
                message="Usuário editado com sucesso!"
              />

              {/* ==================== */}
              {/* MODAL DE EXCLUSÃO */}
              {/* ==================== */}

              <Modal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                type="success"
                message="Usuário excluído com sucesso!"
              />

              {/* ==================== */}
              {/* MODAL DE ERRO */}
              {/* ==================== */}

              <Modal
                open={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                type="error"
                message="Não foi possível criar o usuário!"
              />
            </CardContent>
          </Card>
        </section>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Tabela com campo de filtros</CardTitle>
            <CardDescription>Lista de salas cadastradas.</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-4">
              <TableFilters
                fields={[
                  {
                    name: "codigo",
                    label: "Código",
                    placeholder: "Digite aqui...",
                    type: "input",
                  },
                  {
                    name: "capacidade",
                    label: "Capacidade",
                    placeholder: "Digite aqui...",
                    type: "input",
                  },
                  {
                    name: "tipo",
                    label: "Tipo",
                    placeholder: "Digite aqui...",
                    type: "input",
                  },
                ]}
              />

              <DataTable
                data={rooms}
                getRowKey={(room) => room.codigo}
                columns={[
                  {
                    key: "codigo",
                    label: "Código",
                  },
                  {
                    key: "capacidade",
                    label: "Capacidade",
                  },
                  {
                    key: "tipo",
                    label: "Tipo",
                  },
                ]}
                actions={[
                  {
                    label: "Configurar",
                    icon: <Wrench className="size-[22px]" strokeWidth={2} />,
                    onClick: (room) => {
                      console.log("Configurar:", room);
                    },
                  },
                  {
                    label: "Editar",
                    icon: <Pencil className="size-[21px]" strokeWidth={2} />,
                    onClick: (room) => {
                      console.log("Editar:", room);
                    },
                  },
                  {
                    label: "Excluir",
                    icon: <Trash2 className="size-[21px]" strokeWidth={2} />,
                    className: "text-[#FF0000] hover:bg-red-50",
                    onClick: (room) => {
                      console.log("Excluir:", room);
                    },
                  },
                ]}
              />
            </div>
            <Pagination totalItems={30} currentPage={1} itemsPerPage={6} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
