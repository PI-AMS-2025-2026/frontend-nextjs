"use client";

import * as React from "react";
import {
    CheckCircle,
    CircleSlash,
    Pencil,
    Plus,
    Trash2,
    Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput, Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dropdown } from "@/components/ui/dropdown";
import { TableFilters } from "@/components/ui/tablefilters";
import { DataTable } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";

import { usuariosService } from "@/services/usuarios.service";
import type {
    UsuarioResponse,
    UsuarioRequest,
    Status,
    TipoUsuario,
    PageResponse,
} from "@/types/api";
import { ApiError } from "@/lib/api";

interface FormUsuario {
    nome: string;
    email: string;
    tipoUsuario: TipoUsuario;
    status: Status;
}

const formularioInicial: FormUsuario = {
    nome: "",
    email: "",
    tipoUsuario: "ADMINISTRADOR",
    status: "ATIVO",
};

export default function CadastroUsuario() {
    const [pageData, setPageData] = React.useState<PageResponse<UsuarioResponse>>({
        content: [],
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = React.useState(true);

    const [search, setSearch] = React.useState("");
    const [filters, setFilters] = React.useState<{ status: string; tipo: string }>({
        status: "",
        tipo: "",
    });

    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage, setItemsPerPage] = React.useState(10);

    const [modalAberto, setModalAberto] = React.useState(false);
    const [usuarioEditando, setUsuarioEditando] = React.useState<UsuarioResponse | null>(null);
    const [formulario, setFormulario] = React.useState<FormUsuario>(formularioInicial);
    const [senha, setSenha] = React.useState("");
    const [erro, setErro] = React.useState("");
    const [modalSucesso, setModalSucesso] = React.useState(false);
    const [mensagemSucesso, setMensagemSucesso] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);

    const carregarUsuarios = React.useCallback(async () => {
        setLoading(true);
        try {
            const statusParam = filters.status === "Ativo" ? "ATIVO" : filters.status === "Inativo" ? "INATIVO" : undefined;
            const tipoParam = filters.tipo === "Administrador" ? "ADMINISTRADOR" : filters.tipo === "Coordenador" ? "COORDENADOR" : undefined;

            const res = await usuariosService.listar({
                page: currentPage - 1,
                size: itemsPerPage,
                nome: search || undefined,
                status: statusParam,
                tipo_usuario: tipoParam,
            });
            setPageData(res);
        } catch (err) {
            console.error("Erro ao carregar usuários:", err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, search, filters]);

    React.useEffect(() => {
        carregarUsuarios();
    }, [carregarUsuarios]);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [search, filters]);

    function abrirCadastro() {
        setUsuarioEditando(null);
        setFormulario(formularioInicial);
        setSenha("");
        setErro("");
        setModalAberto(true);
    }

    function abrirEdicao(usuario: UsuarioResponse) {
        setUsuarioEditando(usuario);
        setFormulario({
            nome: usuario.nome,
            email: usuario.email,
            tipoUsuario: usuario.tipoUsuario,
            status: usuario.status,
        });
        setSenha("");
        setErro("");
        setModalAberto(true);
    }

    function fecharModal() {
        setModalAberto(false);
        setUsuarioEditando(null);
        setFormulario(formularioInicial);
        setSenha("");
        setErro("");
    }

    async function salvarUsuario(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!formulario.nome.trim() || !formulario.email.trim() || !formulario.tipoUsuario) {
            setErro("Preencha todos os campos obrigatórios.");
            return;
        }

        if (!usuarioEditando && !senha.trim()) {
            setErro("A senha é obrigatória para cadastrar um novo usuário.");
            return;
        }

        setErro("");
        setSubmitting(true);

        try {
            const payload: UsuarioRequest = {
                nome: formulario.nome,
                email: formulario.email,
                tipoUsuario: formulario.tipoUsuario,
                status: formulario.status,
                ...(senha ? { senha } : {}),
            };

            if (usuarioEditando) {
                await usuariosService.atualizar(usuarioEditando.id, payload);
                setMensagemSucesso("Usuário editado com sucesso!");
            } else {
                await usuariosService.criar(payload);
                setMensagemSucesso("Usuário cadastrado com sucesso!");
            }

            fecharModal();
            setModalSucesso(true);
            carregarUsuarios();
        } catch (err) {
            if (err instanceof ApiError) {
                setErro(err.message || "Erro ao salvar usuário.");
            } else {
                setErro("Erro inesperado ao salvar usuário.");
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function excluirUsuario(usuario: UsuarioResponse) {
        const confirmou = window.confirm(`Deseja excluir o usuário "${usuario.nome}"?`);
        if (!confirmou) return;

        try {
            await usuariosService.deletar(usuario.id);
            setMensagemSucesso("Usuário excluído com sucesso!");
            setModalSucesso(true);
            carregarUsuarios();
        } catch (err) {
            alert(err instanceof ApiError ? err.message : "Erro ao excluir usuário.");
        }
    }

    function alterarCampo<K extends keyof FormUsuario>(campo: K, valor: FormUsuario[K]) {
        setFormulario((prev) => ({
            ...prev,
            [campo]: valor,
        }));
    }

    return (
        <>
            <main className="min-h-screen bg-white px-8 py-7">
                <div className="mx-auto w-full max-w-[1118px]">
                    <div className="mb-8 flex items-center justify-between">
                        <h1 className="text-[36px] font-semibold leading-none text-[#111111]">
                            Listagem de Usuários
                        </h1>

                        <div className="flex items-center gap-3">
                            <SearchInput
                                placeholder="Pesquisar..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="h-[45px] w-[205px] rounded-[10px]"
                            />

                            <Button
                                variant="secondary"
                                size="small"
                                onClick={abrirCadastro}
                                className="h-[45px] rounded-[10px] px-5 text-[18px]"
                            >
                                <Plus className="mr-2 size-5" />
                                Cadastrar
                            </Button>
                        </div>
                    </div>

                    <TableFilters
                        fields={[
                            {
                                name: "status",
                                label: "Status",
                                type: "select",
                                placeholder: "Selecione...",
                                width: "w-[225px]",
                                options: [
                                    { label: "Ativo", value: "Ativo" },
                                    { label: "Inativo", value: "Inativo" },
                                ],
                            },
                            {
                                name: "tipo",
                                label: "Tipo de Usuário",
                                type: "select",
                                placeholder: "Selecione...",
                                width: "w-[225px]",
                                options: [
                                    { label: "Administrador", value: "Administrador" },
                                    { label: "Coordenador", value: "Coordenador" },
                                ],
                            },
                        ]}
                        onChange={(values) => {
                            setFilters({
                                status: values.status ?? "",
                                tipo: values.tipo ?? "",
                            });
                        }}
                        onClear={() => {
                            setSearch("");
                            setFilters({ status: "", tipo: "" });
                        }}
                        className="min-h-[94px] rounded-[6px] border-[#C8DDE2] bg-[#F1FBFD] px-6 py-3"
                    />

                    <div className="mt-11">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-[#0099AA]" />
                            </div>
                        ) : (
                            <DataTable
                                data={pageData.content}
                                getRowKey={(usuario) => usuario.id}
                                columns={[
                                    { key: "id", label: "ID" },
                                    { key: "nome", label: "Nome" },
                                    {
                                        key: "email",
                                        label: "Email",
                                        render: (usuario) => (
                                            <span className="font-semibold">{usuario.email}</span>
                                        ),
                                    },
                                    {
                                        key: "tipoUsuario",
                                        label: "Tipo de usuário",
                                        render: (usuario) =>
                                            usuario.tipoUsuario === "ADMINISTRADOR"
                                                ? "Administrador"
                                                : "Coordenador",
                                    },
                                    {
                                        key: "status",
                                        label: "Status",
                                        render: (usuario) =>
                                            usuario.status === "ATIVO" ? (
                                                <span className="flex items-center gap-2 text-[#16B800]">
                                                    <CheckCircle className="size-4" />
                                                    Ativo
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2 text-[#FF1717]">
                                                    <CircleSlash className="size-4" />
                                                    Inativo
                                                </span>
                                            ),
                                    },
                                ]}
                                actions={[
                                    {
                                        label: "Editar usuário",
                                        icon: <Pencil className="size-5" />,
                                        onClick: abrirEdicao,
                                    },
                                    {
                                        label: "Excluir usuário",
                                        icon: <Trash2 className="size-5 text-red-500" />,
                                        onClick: excluirUsuario,
                                    },
                                ]}
                            />
                        )}
                    </div>

                    <Pagination
                        totalItems={pageData.totalElements}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                        className="mt-6"
                    />
                </div>
            </main>

            <Modal
                open={modalAberto}
                onClose={fecharModal}
                className="max-w-[586px] overflow-visible rounded-[20px]"
            >
                <div className="relative">
                    <div className="mb-5">
                        <h2 className="text-[18px] font-semibold text-black">
                            {usuarioEditando ? "Editar Usuário" : "Cadastrar Usuário"}
                        </h2>
                    </div>

                    <form onSubmit={salvarUsuario} className="grid grid-cols-2 gap-x-5 gap-y-6">
                        <Input
                            label="Nome"
                            showLabel
                            placeholder="Digite o nome..."
                            value={formulario.nome}
                            onChange={(event) => alterarCampo("nome", event.target.value)}
                            height="34px"
                            className="rounded-[7px] bg-white text-[12px]"
                        />

                        <Input
                            label="Email"
                            showLabel
                            type="email"
                            placeholder="Digite o email..."
                            value={formulario.email}
                            onChange={(event) => alterarCampo("email", event.target.value)}
                            height="34px"
                            className="rounded-[7px] bg-white text-[12px]"
                        />

                        <div className="col-span-2 grid grid-cols-[1fr_1fr_auto] items-end gap-5">
                            <div>
                                <label className="mb-2 block text-[11px] font-medium text-black">
                                    Tipo Usuário
                                </label>

                                <Dropdown
                                    value={
                                        formulario.tipoUsuario === "ADMINISTRADOR"
                                            ? "Administrador"
                                            : "Coordenador"
                                    }
                                    onChange={(valor) =>
                                        alterarCampo(
                                            "tipoUsuario",
                                            valor === "Administrador"
                                                ? "ADMINISTRADOR"
                                                : "COORDENADOR"
                                        )
                                    }
                                    placeholder="Selecione..."
                                    options={[
                                        { label: "Administrador", value: "Administrador" },
                                        { label: "Coordenador", value: "Coordenador" },
                                    ]}
                                    className="[&>button]:h-[34px] [&>button]:rounded-[7px] [&>button]:border-[#17264D] [&>button]:bg-white [&>button]:text-[12px]"
                                />
                            </div>

                            <Input
                                label="Senha"
                                showLabel
                                type="password"
                                placeholder={usuarioEditando ? "Manter senha atual" : "Digite a senha..."}
                                value={senha}
                                onChange={(event) => setSenha(event.target.value)}
                                height="34px"
                                className="rounded-[7px] bg-white text-[12px]"
                            />

                            <div>
                                <label className="mb-2 block text-[11px] font-medium text-black">
                                    Status
                                </label>

                                <RadioGroup
                                    value={formulario.status === "ATIVO" ? "Ativo" : "Inativo"}
                                    onValueChange={(valor) =>
                                        alterarCampo(
                                            "status",
                                            valor === "Ativo" ? "ATIVO" : "INATIVO"
                                        )
                                    }
                                    className="h-[34px] items-center gap-3"
                                >
                                    <div className="flex items-center gap-1">
                                        <RadioGroupItem
                                            value="Ativo"
                                            className="size-[14px] border-2"
                                        />
                                        <span className="text-[12px] text-black">Ativo</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <RadioGroupItem
                                            value="Inativo"
                                            className="size-[14px] border-2"
                                        />
                                        <span className="text-[12px] text-black">Inativo</span>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

                        {erro && (
                            <p className="col-span-2 text-[12px] font-medium text-[#BA1A1A]">
                                {erro}
                            </p>
                        )}

                        <div className="col-span-2 mt-2 flex items-center justify-end gap-7">
                            <button
                                type="button"
                                onClick={fecharModal}
                                className="text-[12px] font-medium text-black hover:underline"
                            >
                                CANCELAR
                            </button>

                            <Button
                                type="submit"
                                variant="secondary"
                                size="small"
                                disabled={submitting}
                                className="h-[35px] rounded-[7px] px-6 text-[12px]"
                            >
                                {submitting ? "SALVANDO..." : "CONFIRMAR"}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal
                open={modalSucesso}
                onClose={() => setModalSucesso(false)}
                type="success"
                message={mensagemSucesso}
            />
        </>
    );
}