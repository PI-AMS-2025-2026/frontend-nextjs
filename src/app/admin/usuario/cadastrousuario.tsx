"use client";

import * as React from "react";
import {
    CheckCircle,
    CircleSlash,
    Pencil,
    Plus,
    Trash2,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import {
    Input,
    PasswordInput,
} from "@/components/ui/input";

import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group";
import { Dropdown } from "@/components/ui/dropdown";
import { TableFilters } from "@/components/ui/tablefilters";
import { DataTable } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";


interface Usuario {
    id: number;
    nome: string;
    email: string;
    tipo: string;
    status: "Ativo" | "Inativo";
}

interface FormUsuario {
    nome: string;
    email: string;
    tipo: string;
    status: "Ativo" | "Inativo";
}

const usuariosIniciais: Usuario[] = []

const formularioInicial: FormUsuario = {
    nome: "",
    email: "",
    tipo: "",
    status: "Ativo",
};

export default function CadastroUsuario() {
    const [usuarios, setUsuarios] =
        React.useState<Usuario[]>(usuariosIniciais);

    const [search, setSearch] = React.useState("");

    const [filters, setFilters] = React.useState({
        status: "",
        tipo: "",
    });

    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage, setItemsPerPage] = React.useState(2);


    const [modalAberto, setModalAberto] = React.useState(false);


    const [usuarioEditando, setUsuarioEditando] =
        React.useState<Usuario | null>(null);


    const [formulario, setFormulario] =
        React.useState<FormUsuario>(formularioInicial);

    const [senha, setSenha] = React.useState("");
    const [erro, setErro] = React.useState("");
    const [modalSucesso, setModalSucesso] = React.useState(false);
    const [mensagemSucesso, setMensagemSucesso] = React.useState("");

    const usuariosFiltrados = React.useMemo(() => {
        return usuarios.filter((usuario) => {
            const texto = search.toLowerCase();

            const correspondeBusca =
                usuario.nome.toLowerCase().includes(texto) ||
                usuario.email.toLowerCase().includes(texto);

            const correspondeStatus =
                !filters.status || usuario.status === filters.status;

            const correspondeTipo =
                !filters.tipo || usuario.tipo === filters.tipo;

            return (
                correspondeBusca &&
                correspondeStatus &&
                correspondeTipo
            );
        });
    }, [usuarios, search, filters]);


    const inicio = (currentPage - 1) * itemsPerPage;
    const fim = inicio + itemsPerPage;

    const usuariosPagina = usuariosFiltrados.slice(inicio, fim);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [search, filters, itemsPerPage]);


    function abrirCadastro() {
        setUsuarioEditando(null);
        setFormulario(formularioInicial);
        setSenha("");
        setErro("");
        setModalAberto(true);
    }



    function abrirEdicao(usuario: Usuario) {
        setUsuarioEditando(usuario);

        setFormulario({
            nome: usuario.nome,
            email: usuario.email,
            tipo: usuario.tipo,
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

    function salvarUsuario(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (
            !formulario.nome.trim() ||
            !formulario.email.trim() ||
            !formulario.tipo
        ) {
            setErro("Preencha todos os campos obrigatórios.");
            return;
        }

        const editando = usuarioEditando !== null;

        if (editando) {
            setUsuarios((usuariosAtuais) =>
                usuariosAtuais.map((usuario) =>
                    usuario.id === usuarioEditando.id
                        ? {
                            ...usuario,
                            ...formulario,
                        }
                        : usuario,
                ),
            );

            setMensagemSucesso("Usuário editado com sucesso!");
        } else {
            const novoUsuario: Usuario = {
                id:
                    usuarios.length > 0
                        ? Math.max(...usuarios.map((usuario) => usuario.id)) + 1
                        : 1,
                ...formulario,
            };

            setUsuarios((usuariosAtuais) => [
                ...usuariosAtuais,
                novoUsuario,
            ]);

            setMensagemSucesso("Usuário cadastrado com sucesso!");
        }

        setModalAberto(false);
        setUsuarioEditando(null);
        setFormulario(formularioInicial);
        setSenha("");
        setErro("");
        setModalSucesso(true);
    }



    function excluirUsuario() {
        if (!usuarioEditando) return;

        const confirmou = window.confirm(
            `Deseja excluir o usuário "${usuarioEditando.nome}"?`,
        );

        if (!confirmou) return;

        setUsuarios((usuariosAtuais) =>
            usuariosAtuais.filter(
                (usuario) => usuario.id !== usuarioEditando.id,
            ),
        );

        fecharModal();
    }

    function alterarCampo(
        campo: keyof FormUsuario,
        valor: string,
    ) {
        setFormulario((formularioAtual) => ({
            ...formularioAtual,
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
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
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
                                    {
                                        label: "Ativo",
                                        value: "Ativo",
                                    },
                                    {
                                        label: "Inativo",
                                        value: "Inativo",
                                    },
                                ],
                            },
                            {
                                name: "tipo",
                                label: "Tipo de Usuário",
                                type: "select",
                                placeholder: "Selecione...",
                                width: "w-[225px]",
                                options: [
                                    {
                                        label: "Administrador",
                                        value: "Administrador",
                                    },
                                    {
                                        label: "Coordenador",
                                        value: "Coordenador",
                                    },
                                    {
                                        label: "Professor",
                                        value: "Professor",
                                    },
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

                            setFilters({
                                status: "",
                                tipo: "",
                            });
                        }}
                        className="min-h-[94px] rounded-[6px] border-[#C8DDE2] bg-[#F1FBFD] px-6 py-3"
                    />



                    <div className="mt-11">
                        <DataTable
                            data={usuariosPagina}
                            getRowKey={(usuario) => usuario.id}
                            columns={[
                                {
                                    key: "id",
                                    label: "ID",
                                },
                                {
                                    key: "nome",
                                    label: "Nome",
                                },
                                {
                                    key: "email",
                                    label: "Email",
                                    render: (usuario) => (
                                        <span className="font-semibold">
                                            {usuario.email}
                                        </span>
                                    ),
                                },
                                {
                                    key: "tipo",
                                    label: "Tipo de usuário",
                                },
                                {
                                    key: "status",
                                    label: "Status",
                                    render: (usuario) =>
                                        usuario.status === "Ativo" ? (
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
                            ]}
                        />
                    </div>



                    <Pagination
                        totalItems={usuariosFiltrados.length}
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
                            {usuarioEditando
                                ? "Editar Usuário"
                                : "Cadastrar Usuário"}
                        </h2>
                    </div>

                    <form
                        onSubmit={salvarUsuario}
                        className="grid grid-cols-2 gap-x-5 gap-y-6"
                    >
                        {/* NOME */}
                        <Input
                            label="Nome"
                            showLabel
                            placeholder="Enter text here..."
                            value={formulario.nome}
                            onChange={(event) =>
                                alterarCampo("nome", event.target.value)
                            }
                            height="34px"
                            className="rounded-[7px] bg-white text-[12px]"
                        />

                        {/* EMAIL */}
                        <Input
                            label="Email"
                            showLabel
                            type="email"
                            placeholder="Enter text here..."
                            value={formulario.email}
                            onChange={(event) =>
                                alterarCampo("email", event.target.value)
                            }
                            height="34px"
                            className="rounded-[7px] bg-white text-[12px]"
                        />

                        {/* TIPO DE USUÁRIO */}
                        <div className="col-span-2 grid grid-cols-[1fr_1fr_auto] items-end gap-5">
                            {/* TIPO */}
                            <div>
                                <label className="mb-2 block text-[11px] font-medium text-black">
                                    Tipo Usuário
                                </label>

                                <Dropdown
                                    value={formulario.tipo}
                                    onChange={(valor) =>
                                        alterarCampo("tipo", valor)
                                    }
                                    placeholder="Enter text here..."
                                    options={[
                                        {
                                            label: "Administrador",
                                            value: "Administrador",
                                        },
                                        {
                                            label: "Coordenador",
                                            value: "Coordenador",
                                        },
                                        {
                                            label: "Professor",
                                            value: "Professor",
                                        },
                                    ]}
                                    className="[&>button]:h-[34px] [&>button]:rounded-[7px] [&>button]:border-[#17264D] [&>button]:bg-white [&>button]:text-[12px]"
                                />
                            </div>

                            {/* SENHA */}
                            <Input
                                label="Senha"
                                showLabel
                                placeholder="********"
                                value={senha}
                                onChange={(event) => setSenha(event.target.value)}
                                height="34px"
                                className="rounded-[7px] bg-white text-[12px]"
                            />

                            {/* STATUS */}
                            <div>
                                <label className="mb-2 block text-[11px] font-medium text-black">
                                    Status
                                </label>

                                <RadioGroup
                                    value={formulario.status}
                                    onValueChange={(valor) =>
                                        alterarCampo(
                                            "status",
                                            valor as "Ativo" | "Inativo"
                                        )
                                    }
                                    className="h-[34px] items-center gap-3"
                                >
                                    <div className="flex items-center gap-1">
                                        <RadioGroupItem
                                            value="Ativo"
                                            className="size-[14px] border-2"
                                        />

                                        <span className="text-[12px] text-black">
                                            Ativo
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <RadioGroupItem
                                            value="Inativo"
                                            className="size-[14px] border-2"
                                        />

                                        <span className="text-[12px] text-black">
                                            Inativo
                                        </span>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                        {/* ERRO */}
                        {erro && (
                            <p className="col-span-2 text-[12px] font-medium text-[#BA1A1A]">
                                {erro}
                            </p>
                        )}

                        {/* BOTÕES */}
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
                                className="h-[35px] rounded-[7px] px-6 text-[12px]"
                            >
                                CONFIRMAR
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