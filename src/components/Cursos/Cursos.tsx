'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Curso, CursoPayload, Periodicidade } from '@/models/curso';
import * as cursoService from '@/services/cursoService';
import CursoFormModal from '../CursoFormModal/CursoFormModal';
import SuccessModal from '../SuccessModal/SuccessModal';
import Pagination from '../Pagination/Pagination';
import styles from './Cursos.module.css';

type SuccessKind = 'cadastro' | 'edicao' | null;

const PERIODICIDADES: Periodicidade[] = ['Bimestral', 'Trimestral', 'Semestral', 'Anual'];

export default function Cursos() {
  const router = useRouter();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [carregando, setCarregando] = useState(false);

  // Pesquisa e filtros
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroPeriodicidade, setFiltroPeriodicidade] = useState<Periodicidade | ''>('');
  const [filtroDuracao, setFiltroDuracao] = useState('');

  // Ordenação da coluna Status (clicável, como no protótipo)
  const [ordemStatus, setOrdemStatus] = useState<'asc' | 'desc' | null>(null);

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(6);

  // Modal de cadastro/edição
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [cursoSelecionado, setCursoSelecionado] = useState<Curso | null>(null);
  const [salvandoForm, setSalvandoForm] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  // Modal de sucesso
  const [modalSucessoAberto, setModalSucessoAberto] = useState(false);
  const [sucessoTipo, setSucessoTipo] = useState<SuccessKind>(null);

  useEffect(() => {
    carregarCursos();
  }, []);

  function carregarCursos() {
    setCarregando(true);
    cursoService
      .listar()
      .then(setCursos)
      .finally(() => setCarregando(false));
  }

  // ----------------- Pesquisa + Filtros -----------------

  const cursosFiltrados = useMemo(() => {
    const termo = termoPesquisa.trim().toLowerCase();
    const nomeFiltro = filtroNome.trim().toLowerCase();
    const duracaoFiltro = filtroDuracao.trim().toLowerCase();

    let resultado = cursos.filter((c) => {
      const combinaTermo =
        !termo ||
        c.nome.toLowerCase().includes(termo) ||
        c.periodicidade.toLowerCase().includes(termo) ||
        c.duracao.toLowerCase().includes(termo);

      const combinaNome = !nomeFiltro || c.nome.toLowerCase().includes(nomeFiltro);
      const combinaPeriodicidade = !filtroPeriodicidade || c.periodicidade === filtroPeriodicidade;
      const combinaDuracao = !duracaoFiltro || c.duracao.toLowerCase().includes(duracaoFiltro);

      return combinaTermo && combinaNome && combinaPeriodicidade && combinaDuracao;
    });

    if (ordemStatus) {
      resultado = [...resultado].sort((a, b) =>
        ordemStatus === 'asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status)
      );
    }

    return resultado;
  }, [cursos, termoPesquisa, filtroNome, filtroPeriodicidade, filtroDuracao, ordemStatus]);

  const cursosPaginaAtual = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return cursosFiltrados.slice(inicio, inicio + itensPorPagina);
  }, [cursosFiltrados, paginaAtual, itensPorPagina]);

  function resetarPagina() {
    setPaginaAtual(1);
  }

  function limparFiltros() {
    setFiltroNome('');
    setFiltroPeriodicidade('');
    setFiltroDuracao('');
    resetarPagina();
  }

  function alternarOrdemStatus() {
    setOrdemStatus((atual) => (atual === 'asc' ? 'desc' : atual === 'desc' ? null : 'asc'));
  }

  // ----------------- Cadastro / Edição -----------------

  function abrirCadastro() {
    setCursoSelecionado(null);
    setErroForm(null);
    setModalFormAberto(true);
  }

  function abrirEdicao(curso: Curso) {
    setCursoSelecionado(curso);
    setErroForm(null);
    setModalFormAberto(true);
  }

  function fecharModalForm() {
    setModalFormAberto(false);
    setCursoSelecionado(null);
    setErroForm(null);
  }

  async function salvarCurso(payload: CursoPayload) {
    setSalvandoForm(true);
    setErroForm(null);

    const tipo: SuccessKind = cursoSelecionado ? 'edicao' : 'cadastro';

    try {
      if (cursoSelecionado) {
        await cursoService.editar(cursoSelecionado.id, payload);
      } else {
        await cursoService.criar(payload);
      }
      setSalvandoForm(false);
      setModalFormAberto(false);
      setCursoSelecionado(null);
      exibirSucesso(tipo);
      carregarCursos();
    } catch (err) {
      setSalvandoForm(false);
      setErroForm(err instanceof Error ? err.message : 'Não foi possível salvar o curso.');
    }
  }

  // ----------------- Modal de Sucesso -----------------

  function exibirSucesso(tipo: SuccessKind) {
    setSucessoTipo(tipo);
    setModalSucessoAberto(true);
  }

  function fecharModalSucesso() {
    setModalSucessoAberto(false);
    setSucessoTipo(null);
  }

  const mensagemSucesso =
    sucessoTipo === 'cadastro'
      ? 'Curso cadastrado com sucesso!'
      : sucessoTipo === 'edicao'
        ? 'Curso editado com sucesso!'
        : '';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          {/*
            A navegação/navbar de verdade é responsabilidade de outra parte
            do time. Aqui a setinha só volta no histórico do navegador —
            não depende de nenhuma rota específica deste projeto.
          */}
          <button type="button" onClick={() => router.back()} className={styles.backLink} aria-label="Voltar">
            ←
          </button>
          <div>
            <h1>Cursos</h1>
            <p className={styles.subtitle}>Gerencie os cursos da instituição</p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.searchBox}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" className={styles.searchIcon}>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={termoPesquisa}
              onChange={(e) => {
                setTermoPesquisa(e.target.value);
                resetarPagina();
              }}
            />
          </div>

          <button type="button" className={styles.btnPrimary} onClick={abrirCadastro}>
            <span className={styles.plus}>+</span> Cadastrar
          </button>
        </div>
      </div>

      <div className={styles.filtersBar}>
        <div className={styles.filterField}>
          <label>Nome</label>
          <input
            type="text"
            placeholder="Filtrar por nome"
            value={filtroNome}
            onChange={(e) => {
              setFiltroNome(e.target.value);
              resetarPagina();
            }}
          />
        </div>
        <div className={styles.filterField}>
          <label>Periodicidade</label>
          <select
            value={filtroPeriodicidade}
            onChange={(e) => {
              setFiltroPeriodicidade(e.target.value as Periodicidade | '');
              resetarPagina();
            }}
          >
            <option value="">Selecione...</option>
            {PERIODICIDADES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterField}>
          <label>Duração</label>
          <input
            type="text"
            placeholder="Ex: 3 anos"
            value={filtroDuracao}
            onChange={(e) => {
              setFiltroDuracao(e.target.value);
              resetarPagina();
            }}
          />
        </div>

        <button type="button" className={`${styles.btnPrimary} ${styles.btnLimpar}`} onClick={limparFiltros}>
          Limpar filtros
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Periodicidade</th>
              <th>Duração</th>
              <th className={styles.sortable} onClick={alternarOrdemStatus}>
                Status
                <span className={styles.sortIcon}>
                  {ordemStatus === 'asc' ? '▲' : ordemStatus === 'desc' ? '▼' : '▾'}
                </span>
              </th>
              <th className={styles.colAcoes}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {cursosPaginaAtual.map((curso) => (
              <tr key={curso.id}>
                <td>{curso.nome}</td>
                <td>{curso.periodicidade}</td>
                <td>{curso.duracao}</td>
                <td>
                  {curso.status === 'ativo' ? (
                    <span className={`${styles.statusBadge} ${styles.statusAtivo}`}>
                      <span className={styles.statusDot} /> Ativo
                    </span>
                  ) : (
                    <span className={`${styles.statusBadge} ${styles.statusInativo}`}>
                      <span className={styles.statusDot} /> Inativo
                    </span>
                  )}
                </td>
                <td className={styles.colAcoes}>
                  <button
                    type="button"
                    className={styles.iconAction}
                    onClick={() => abrirEdicao(curso)}
                    aria-label="Editar curso"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                      <path
                        d="M4 20h4L18.5 9.5a2.121 2.121 0 0 0-3-3L5 17v3Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      <path d="M13.5 6.5l4 4" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}

            {!carregando && cursosPaginaAtual.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  Nenhum curso encontrado para os filtros informados.
                </td>
              </tr>
            )}
            {carregando && (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  Carregando cursos...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        totalItems={cursosFiltrados.length}
        pageSize={itensPorPagina}
        currentPage={paginaAtual}
        onPageChange={setPaginaAtual}
        onPageSizeChange={(size) => {
          setItensPorPagina(size);
          resetarPagina();
        }}
      />

      <CursoFormModal
        open={modalFormAberto}
        curso={cursoSelecionado}
        loading={salvandoForm}
        serverError={erroForm}
        onConfirm={salvarCurso}
        onCancel={fecharModalForm}
      />

      <SuccessModal open={modalSucessoAberto} message={mensagemSucesso} onClose={fecharModalSucesso} />
    </div>
  );
}
