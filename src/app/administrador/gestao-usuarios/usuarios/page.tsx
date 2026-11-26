"use client";

import * as React from "react";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle,
    CircleSlash,
    Pencil,
    Plus,
    Power,
    PowerOff,
    Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput, Input, PasswordInput } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dropdown } from "@/components/ui/dropdown";
import { TableFilters } from "@/components/ui/tablefilters";
import { DataTable } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";

import { usuariosService } from "@/services/usuarios.service";
import { cursosService } from "@/services/cursos.service";
import { authService } from "@/services/auth.service";
import { authSessionEvents } from "@/services/auth-session";
import type {
    UsuarioResponse,
    UsuarioRequest,
    CursoResponse,
    Status,
    TipoUsuario,
    PageResponse,
} from "@/types/api";
import { ApiError } from "@/lib/api";
import { senhaForte, SENHA_FORTE_MENSAGEM } from "@/lib/password-policy";

interface FormUsuario {
    nome: string;
    email: string;
    tipoUsuario: TipoUsuario;
    status: Status;
    cursoId: string;
}

const formularioInicial: FormUsuario = {
    nome: "",
    email: "",
    tipoUsuario: "ADMINISTRADOR",
    status: "ATIVO",
    cursoId: "",
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
    const [cursos, setCursos] = React.useState<CursoResponse[]>([]);
    const [erroCursos, setErroCursos] = React.useState("");
    const [tentativaCursos, setTentativaCursos] = React.useState(0);

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
    const [errosCampos, setErrosCampos] = React.useState<Record<string, string>>({});
    const [modalSucesso, setModalSucesso] = React.useState(false);
    const [mensagemSucesso, setMensagemSucesso] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);
    const [usuarioParaInativar, setUsuarioParaInativar] = React.useState<UsuarioResponse | null>(null);
    const [erroInativacao, setErroInativacao] = React.useState("");
    const [inativando, setInativando] = React.useState(false);
    const [usuarioAutenticado, setUsuarioAutenticado] = React.useState<Pick<UsuarioResponse, "id" | "tipoUsuario"> | null>(null);

    React.useEffect(() => {
        const sincronizarUsuario = () => {
            const usuario = authService.getUser() as Partial<UsuarioResponse> | null;
            setUsuarioAutenticado(usuario?.id && usuario.tipoUsuario
                ? { id: usuario.id, tipoUsuario: usuario.tipoUsuario }
                : null);
        };

        sincronizarUsuario();
        window.addEventListener(authSessionEvents.userUpdated, sincronizarUsuario);
        return () => window.removeEventListener(authSessionEvents.userUpdated, sincronizarUsuario);
    }, []);

    const ehAdministradorAutenticado = (usuario: UsuarioResponse) =>
        usuario.tipoUsuario === "ADMINISTRADOR"
        && usuarioAutenticado?.tipoUsuario === "ADMINISTRADOR"
        && usuario.id === usuarioAutenticado.id;

    // Alterar a busca ou os filtros volta para a primeira pagina. O reset
    // acontece junto da acao do usuario, em vez de um efeito reagindo ao
    // estado derivado (o que causava um render extra a cada digitacao).
    const aplicarBusca = React.useCallback((valor: string) => {
        setSearch(valor);
        setCurrentPage(1);
    }, []);

    const aplicarFiltros = React.useCallback(
        (novos: { status: string; tipo: string }) => {
            setFilters(novos);
            setCurrentPage(1);
        },
        [],
    );

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
        let vivo = true;
        // A chamada e adiada para um microtask porque o carregamento liga o
        // estado de loading de forma sincrona; assim o efeito nao encadeia um
        // render dentro do proprio commit. O guard evita atualizar apos desmontar.
        void Promise.resolve().then(() => {
            if (vivo) carregarUsuarios();
        });
        return () => {
            vivo = false;
        };
    }, [carregarUsuarios]);

    React.useEffect(() => {
        let ativo = true;
        cursosService.listarTodos({ status: "ATIVO" })
            .then((resposta) => {
                if (ativo) { setCursos(resposta); setErroCursos(""); }
            })
            .catch(() => { if (ativo) { setCursos([]); setErroCursos("Não foi possível carregar os cursos."); } });
        return () => {
            ativo = false;
        };
    }, [tentativaCursos]);

    function abrirCadastro() {
        setTentativaCursos((atual) => atual + 1);
        setUsuarioEditando(null);
        setFormulario(formularioInicial);
        setSenha("");
        setErro("");
        setErrosCampos({});
        setModalAberto(true);
    }

    function abrirEdicao(usuario: UsuarioResponse) {
        setTentativaCursos((atual) => atual + 1);
        setUsuarioEditando(usuario);
        setFormulario({
            nome: usuario.nome,
            email: usuario.email,
            tipoUsuario: usuario.tipoUsuario,
            status: usuario.status,
            cursoId: usuario.curso?.id.toString() ?? "",
        });
        setSenha("");
        setErro("");
        setErrosCampos({});
        setModalAberto(true);
    }

    function fecharModal() {
        setModalAberto(false);
        setUsuarioEditando(null);
        setFormulario(formularioInicial);
        setSenha("");
        setErro("");
        setErrosCampos({});
    }

    async function salvarUsuario(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!formulario.nome.trim() || !formulario.email.trim() || !formulario.tipoUsuario) {
            setErrosCampos({
                ...(!formulario.nome.trim() ? { nome: "Nome é obrigatório." } : {}),
                ...(!formulario.email.trim() ? { email: "E-mail é obrigatório." } : {}),
                ...(!formulario.tipoUsuario ? { tipoUsuario: "Tipo de usuário é obrigatório." } : {}),
            });
            return;
        }

        if (!usuarioEditando && !senha.trim()) {
            setErrosCampos({ senha: "Informe a senha." });
            return;
        }

        if (senha.trim() && !senhaForte(senha)) {
            setErrosCampos({ senha: SENHA_FORTE_MENSAGEM });
            return;
        }

        if (formulario.tipoUsuario === "COORDENADOR" && !formulario.cursoId) {
            setErrosCampos({ curso: "Selecione o curso do coordenador." });
            return;
        }

        setErro("");
        setErrosCampos({});
        setSubmitting(true);

        try {
            const payload: UsuarioRequest = {
                nome: formulario.nome,
                email: formulario.email,
                tipoUsuario: formulario.tipoUsuario,
                status: formulario.status,
                ...(senha.trim() ? { senha } : {}),
                ...(formulario.tipoUsuario === "COORDENADOR"
                    ? { curso: { id: Number(formulario.cursoId) } }
                    : {}),
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
                const data = err.data as { fieldErrors?: Array<{ field?: string; message?: string }>; errors?: string[] } | undefined;
                const fieldErrors: Record<string, string> = {};
                for (const item of data?.fieldErrors ?? []) {
                    if (item.field && item.message) fieldErrors[item.field] = item.message;
                }
                for (const message of data?.errors ?? []) {
                    const normalized = message.toLocaleLowerCase("pt-BR");
                    const field = normalized.includes("nome") ? "nome"
                        : normalized.includes("e-mail") || normalized.includes("email") ? "email"
                        : normalized.includes("senha") ? "senha"
                        : normalized.includes("tipo de usuário") ? "tipoUsuario"
                        : normalized.includes("curso") ? "curso"
                        : undefined;
                    if (field && !fieldErrors[field]) fieldErrors[field] = message;
                }
                if (err.message.toLocaleLowerCase("pt-BR").includes("curso")) {
                    fieldErrors.curso ??= err.message;
                }
                setErrosCampos(fieldErrors);
                setErro(Object.keys(fieldErrors).length ? "" : err.message || "Erro ao salvar usuário.");
            } else {
                setErro("Erro inesperado ao salvar usuário.");
            }
        } finally {
            setSubmitting(false);
        }
    }

    function abrirAlteracaoStatus(usuario: UsuarioResponse) {
        setErroInativacao("");
        setUsuarioParaInativar(usuario);
    }

    function fecharInativacao() {
        if (!inativando) setUsuarioParaInativar(null);
    }

    async function confirmarAlteracaoStatus() {
        if (!usuarioParaInativar || inativando) return;
        setInativando(true);
        setErroInativacao("");
        const ativandoUsuario = usuarioParaInativar.status === "INATIVO";
        try {
            if (ativandoUsuario) {
                await usuariosService.atualizar(usuarioParaInativar.id, {
                    nome: usuarioParaInativar.nome,
                    email: usuarioParaInativar.email,
                    tipoUsuario: usuarioParaInativar.tipoUsuario,
                    status: "ATIVO",
                    ...(usuarioParaInativar.curso ? { curso: { id: usuarioParaInativar.curso.id } } : {}),
                });
            } else {
                await usuariosService.deletar(usuarioParaInativar.id);
            }
            setUsuarioParaInativar(null);
            setMensagemSucesso(ativandoUsuario ? "Usuário ativado com sucesso!" : "Usuário inativado com sucesso!");
            setModalSucesso(true);
            carregarUsuarios();
        } catch (err) {
            setErroInativacao(err instanceof ApiError && err.message
                ? err.message
                : `Erro ao ${ativandoUsuario ? "ativar" : "inativar"} usuário.`);
        } finally {
            setInativando(false);
        }
    }

    function alterarCampo<K extends keyof FormUsuario>(campo: K, valor: FormUsuario[K]) {
        setFormulario((prev) => ({
            ...prev,
            [campo]: valor,
        }));
        setErrosCampos((prev) => {
            if (!(campo in prev)) return prev;
            const proximo = { ...prev };
            delete proximo[campo];
            return proximo;
        });
    }

    return (
        <>
            <main className="min-h-screen bg-white px-8 py-7">
                <div className="mx-auto w-full max-w-[1118px]">
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/administrador/home"
                                aria-label="Voltar para a página inicial"
                                className="flex size-9 items-center justify-center rounded-lg text-[#17264D]/70 transition-colors hover:bg-[#F2F2F2]"
                            >
                                <ArrowLeft className="size-6" />
                            </Link>
                            <div>
                                <h1 className="text-[36px] font-semibold leading-none text-[#111111]">
                                    Listagem de Usuários
                                </h1>
                                <p className="mt-1 text-sm text-[#17264D]/70">
                                    Gerencie os usuários da instituição
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <SearchInput
                                placeholder="Pesquisar..."
                                value={search}
                                onChange={(event) => aplicarBusca(event.target.value)}
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
                                placeholder: "Todos",
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
                                placeholder: "Todos",
                                width: "w-[225px]",
                                options: [
                                    { label: "Administrador", value: "Administrador" },
                                    { label: "Coordenador", value: "Coordenador" },
                                ],
                            },
                        ]}
                        onChange={(values) => {
                            aplicarFiltros({
                                status: values.status ?? "",
                                tipo: values.tipo ?? "",
                            });
                        }}
                        onClear={() => {
                            aplicarBusca("");
                            aplicarFiltros({ status: "", tipo: "" });
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
                                        label: (usuario) => usuario.status === "ATIVO" ? "Inativar usuário" : "Ativar usuário",
                                        icon: (usuario) => usuario.status === "ATIVO"
                                            ? <PowerOff className="size-5 text-red-500" />
                                            : <Power className="size-5 text-emerald-600" />,
                                        onClick: abrirAlteracaoStatus,
                                        disabled: (usuario) => usuario.status === "ATIVO" && ehAdministradorAutenticado(usuario),
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
                className="max-w-[640px] overflow-visible rounded-[20px]"
            >
                <div className="relative">
                    <div className="mb-5">
                        <h2 className="text-[18px] font-semibold text-black">
                            {usuarioEditando ? "Editar Usuário" : "Cadastrar Usuário"}
                        </h2>
                    </div>

                    <form onSubmit={salvarUsuario} noValidate className="grid grid-cols-1 items-start gap-x-5 gap-y-4 sm:grid-cols-2">
                        <div className="min-w-0">
                        <Input
                            label="Nome"
                            showLabel
                            placeholder="Digite o nome..."
                            value={formulario.nome}
                            onChange={(event) => alterarCampo("nome", event.target.value)}
                            aria-invalid={!!errosCampos.nome}
                            aria-describedby={errosCampos.nome ? "usuario-nome-erro" : undefined}
                            height="34px"
                            className={`rounded-[7px] bg-white text-[12px] ${errosCampos.nome ? "border-[#BA1A1A] focus:border-[#BA1A1A]" : ""}`}
                        />
                        {errosCampos.nome && <p id="usuario-nome-erro" className="mt-1.5 text-[11px] leading-4 text-[#BA1A1A]">{errosCampos.nome}</p>}
                        </div>

                        <div className="min-w-0">
                        <Input
                            label="Email"
                            showLabel
                            type="email"
                            placeholder="Digite o email..."
                            value={formulario.email}
                            onChange={(event) => alterarCampo("email", event.target.value)}
                            aria-invalid={!!errosCampos.email}
                            aria-describedby={errosCampos.email ? "usuario-email-erro" : undefined}
                            height="34px"
                            className={`rounded-[7px] bg-white text-[12px] ${errosCampos.email ? "border-[#BA1A1A] focus:border-[#BA1A1A]" : ""}`}
                        />
                        {errosCampos.email && <p id="usuario-email-erro" className="mt-1.5 text-[11px] leading-4 text-[#BA1A1A]">{errosCampos.email}</p>}
                        </div>

                        <div className="min-w-0">
                            <div className="mb-2 text-[11px] font-medium text-black">
                                <label id="usuario-tipo-label">
                                    Tipo Usuário
                                </label>
                            </div>

                            <Dropdown
                                value={
                                    formulario.tipoUsuario === "ADMINISTRADOR"
                                        ? "Administrador"
                                        : "Coordenador"
                                }
                                onChange={(valor) => {
                                    const tipoUsuario = valor === "Administrador"
                                        ? "ADMINISTRADOR"
                                        : "COORDENADOR";
                                    alterarCampo("tipoUsuario", tipoUsuario);
                                    if (tipoUsuario === "ADMINISTRADOR") {
                                        alterarCampo("cursoId", "");
                                    }
                                }}
                                placeholder="Selecione..."
                                options={[
                                    { label: "Administrador", value: "Administrador" },
                                    { label: "Coordenador", value: "Coordenador" },
                                ]}
                                className="[&>button]:h-[40px] [&>button]:rounded-[7px] [&>button]:border-[#17264D] [&>button]:bg-white [&>button]:text-[12px]"
                            />
                        </div>

                        <fieldset className="min-w-0">
                            <legend className="mb-2 text-[11px] font-medium text-black">
                                    Status
                            </legend>

                            <RadioGroup
                                value={formulario.status === "ATIVO" ? "Ativo" : "Inativo"}
                                disabled={!!usuarioEditando && ehAdministradorAutenticado(usuarioEditando)}
                                onValueChange={(valor) =>
                                    alterarCampo(
                                        "status",
                                        valor === "Ativo" ? "ATIVO" : "INATIVO"
                                    )
                                }
                                className="flex min-h-[40px] items-center gap-5"
                            >
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="Ativo" className="size-[14px] border-2" />
                                    <span className="text-[12px] text-black">Ativo</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="Inativo" className="size-[14px] border-2" />
                                    <span className="text-[12px] text-black">Inativo</span>
                                </div>
                            </RadioGroup>
                            {!!usuarioEditando && ehAdministradorAutenticado(usuarioEditando) && (
                                <p className="mt-1 text-[10px] leading-4 text-[#17264D]/70">
                                    Administradores não podem se auto inativar.
                                </p>
                            )}
                        </fieldset>

                        <div className="col-span-1 min-w-0 sm:col-span-2">
                            <PasswordInput
                                label="Senha"
                                showLabel
                                placeholder={usuarioEditando ? "Manter senha atual" : "Digite a senha..."}
                                value={senha}
                                minLength={8}
                                onChange={(event) => {
                                    setSenha(event.target.value);
                                    setErrosCampos((prev) => {
                                        if (!prev.senha) return prev;
                                        const proximo = { ...prev };
                                        delete proximo.senha;
                                        return proximo;
                                    });
                                }}
                                aria-invalid={!!errosCampos.senha}
                                aria-describedby={`usuario-senha-requisitos${errosCampos.senha ? " usuario-senha-erro" : ""}`}
                                className={`h-[40px] rounded-[7px] bg-white text-[12px] ${errosCampos.senha ? "border-[#BA1A1A] focus:border-[#BA1A1A]" : ""}`}
                            />
                            <p id="usuario-senha-requisitos" className="mt-1.5 text-[11px] leading-4 text-[#17264D]/70">
                                Mínimo de 8 caracteres, com uma letra maiúscula e uma minúscula.
                                {usuarioEditando ? " Deixe vazio para manter a senha atual." : ""}
                            </p>
                            {errosCampos.senha && <p id="usuario-senha-erro" className="mt-1.5 text-[11px] leading-4 text-[#BA1A1A]">{errosCampos.senha}</p>}
                        </div>

                        {formulario.tipoUsuario === "COORDENADOR" && (
                            <div className="col-span-1 sm:col-span-2">
                                <label className="mb-2 block text-[11px] font-medium text-black">
                                    Curso do Coordenador
                                </label>
                                <Dropdown
                                    value={formulario.cursoId}
                                    onChange={(id) => alterarCampo("cursoId", id)}
                                    placeholder="Selecione o curso..."
                                    options={[
                                        ...cursos,
                                        ...(usuarioEditando?.curso?.status === "INATIVO"
                                            && String(usuarioEditando.curso.id) === formulario.cursoId
                                            ? [usuarioEditando.curso] : []),
                                    ].map((curso) => ({ label: `${curso.nome} — ${curso.periodicidade}, ${curso.duracao} ${curso.periodicidade === "Anual" ? "anos" : "semestres"}${curso.status === "INATIVO" ? " (inativo)" : ""}`, value: String(curso.id) }))}
                                    className="[&>button]:h-[34px] [&>button]:rounded-[7px] [&>button]:border-[#17264D] [&>button]:bg-white [&>button]:text-[12px]"
                                />
                                {erroCursos && <p role="alert" className="mt-1 text-[12px] text-[#BA1A1A]">{erroCursos} <button type="button" className="underline" onClick={() => setTentativaCursos((atual) => atual + 1)}>Tentar novamente</button></p>}
                                {errosCampos.curso && <p className="mt-1 text-[12px] text-[#BA1A1A]">{errosCampos.curso}</p>}
                            </div>
                        )}

                        {errosCampos.tipoUsuario && <p className="col-span-1 -mt-3 text-[11px] leading-4 text-[#BA1A1A] sm:col-span-2">{errosCampos.tipoUsuario}</p>}

                        {erro && (
                            <p className="col-span-1 text-[12px] font-medium text-[#BA1A1A] sm:col-span-2">
                                {erro}
                            </p>
                        )}

                        <div className="col-span-1 mt-2 flex items-center justify-end gap-7 sm:col-span-2">
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
                open={usuarioParaInativar !== null}
                onClose={fecharInativacao}
                closeDisabled={inativando}
                labelledBy="alterar-status-usuario-titulo"
                describedBy="alterar-status-usuario-descricao"
                className="max-w-xl overflow-visible"
            >
                <div className="flex flex-col gap-4">
                    <h2 id="alterar-status-usuario-titulo" className="pr-12 text-xl font-semibold">
                        {usuarioParaInativar?.status === "ATIVO" ? "Inativar usuário" : "Ativar usuário"}
                    </h2>
                    <p id="alterar-status-usuario-descricao" className="wrap-anywhere text-sm">
                        Deseja {usuarioParaInativar?.status === "ATIVO" ? "inativar" : "ativar"} <strong>{usuarioParaInativar?.nome}</strong>?
                    </p>
                    {erroInativacao && <p role="alert" className="text-sm text-[#BA1A1A]">{erroInativacao}</p>}
                    <div className="flex flex-wrap justify-end gap-3">
                        <Button type="button" variant="ghost" size="small" autoFocus disabled={inativando} onClick={fecharInativacao}>
                            Cancelar
                        </Button>
                        <Button type="button" variant={usuarioParaInativar?.status === "ATIVO" ? "danger" : "secondary"} size="small" disabled={inativando} onClick={confirmarAlteracaoStatus}>
                            {inativando
                                ? usuarioParaInativar?.status === "ATIVO" ? "Inativando..." : "Ativando..."
                                : usuarioParaInativar?.status === "ATIVO" ? "Inativar" : "Ativar"}
                        </Button>
                    </div>
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
