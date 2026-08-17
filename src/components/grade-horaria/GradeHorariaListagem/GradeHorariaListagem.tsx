'use client';

import { useEffect, useMemo, useState } from 'react';
import Pagination from '@/components/shared/Pagination/Pagination';
import ConfirmModal from '@/components/shared/ConfirmModal/ConfirmModal';
import SuccessModal from '@/components/shared/SuccessModal/SuccessModal';
import GradeHorariaFormModal from '../GradeHorariaFormModal/GradeHorariaFormModal';
import {
  CURSOS_MOCK,
  formatarData,
  formatarVersao,
  GradeHoraria,
  GradeHorariaPayload,
  PERIODOS_LETIVOS_MOCK,
} from '@/models/grade-horaria';
import * as gradeHorariaService from '@/services/grade-horaria-service';
import styles from './GradeHorariaListagem.module.css';

type SuccessKind = 'cadastro' | 'edicao' | 'copia' | null;

interface GradeHorariaListagemProps {
  onVisualizar: (grade: GradeHoraria) => void;
  /** Opcional — se não vier, usa o histórico do navegador. */
  onVoltar?: () => void;
}

export default function GradeHorariaListagem({ onVisualizar, onVoltar }: GradeHorariaListagemProps) {
  const [grades, setGrades] = useState<GradeHoraria[]>([]);
  const [carregando, setCarregando] = useState(false);

  // Pesquisa e filtros
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [filtroVersao, setFiltroVersao] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [filtroCurso, setFiltroCurso] = useState('');
  const [filtroPeriodoLetivo, setFiltroPeriodoLetivo] = useState('');

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(6);

  // Modal de cadastro/edição
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [gradeSelecionada, setGradeSelecionada] = useState<GradeHoraria | null>(null);
  const [salvandoForm, setSalvandoForm] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  // Modal de cópia
  const [modalCopiaAberto, setModalCopiaAberto] = useState(false);
  const [gradeParaCopiar, setGradeParaCopiar] = useState<GradeHoraria | null>(null);
  const [copiando, setCopiando] = useState(false);

  // Modal de sucesso
  const [modalSucessoAberto, setModalSucessoAberto] = useState(false);
  const [sucessoTipo, setSucessoTipo] = useState<SuccessKind>(null);
  const [gradeRecemCriada, setGradeRecemCriada] = useState<GradeHoraria | null>(null);

  useEffect(() => {
    carregarGrades();
  }, []);

  function carregarGrades() {
    setCarregando(true);
    gradeHorariaService.listar().then(setGrades).finally(() => setCarregando(false));
  }

  function voltar() {
    if (onVoltar) onVoltar();
    else if (typeof window !== 'undefined') window.history.back();
  }

  // ----------------- Pesquisa + Filtros -----------------

  const gradesFiltradas = useMemo(() => {
    const termo = termoPesquisa.trim().toLowerCase();
    const versaoFiltro = filtroVersao.trim();

    return grades.filter((g) => {
      const versaoTexto = formatarVersao(g.versao);
      const combinaTermo =
        !termo ||
        versaoTexto.includes(termo) ||
        g.cursoNome.toLowerCase().includes(termo) ||
        g.periodoLetivo.toLowerCase().includes(termo);

      const combinaVersao = !versaoFiltro || versaoTexto.includes(versaoFiltro.padStart(2, '0'));
      const combinaData = !filtroData || g.dataCriacao === filtroData;
      const combinaCurso = !filtroCurso || g.cursoNome === filtroCurso;
      const combinaPeriodoLetivo = !filtroPeriodoLetivo || g.periodoLetivo === filtroPeriodoLetivo;

      return combinaTermo && combinaVersao && combinaData && combinaCurso && combinaPeriodoLetivo;
    });
  }, [grades, termoPesquisa, filtroVersao, filtroData, filtroCurso, filtroPeriodoLetivo]);

  const gradesPaginaAtual = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return gradesFiltradas.slice(inicio, inicio + itensPorPagina);
  }, [gradesFiltradas, paginaAtual, itensPorPagina]);

  function resetarPagina() {
    setPaginaAtual(1);
  }

  function limparFiltros() {
    setFiltroVersao('');
    setFiltroData('');
    setFiltroCurso('');
    setFiltroPeriodoLetivo('');
    resetarPagina();
  }

  // ----------------- Cadastro / Edição -----------------

  function abrirCadastro() {
    setGradeSelecionada(null);
    setErroForm(null);
    setModalFormAberto(true);
  }

  function abrirEdicao(grade: GradeHoraria) {
    setGradeSelecionada(grade);
    setErroForm(null);
    setModalFormAberto(true);
  }

  function fecharModalForm() {
    setModalFormAberto(false);
    setGradeSelecionada(null);
    setErroForm(null);
  }

  async function salvarGrade(payload: GradeHorariaPayload) {
    setSalvandoForm(true);
    setErroForm(null);
    const tipo: SuccessKind = gradeSelecionada ? 'edicao' : 'cadastro';

    try {
      const resultado = gradeSelecionada
        ? await gradeHorariaService.editar(gradeSelecionada.id, payload)
        : await gradeHorariaService.criar(payload);

      setSalvandoForm(false);
      setModalFormAberto(false);
      setGradeSelecionada(null);
      setGradeRecemCriada(resultado);
      exibirSucesso(tipo);
      carregarGrades();
    } catch (err) {
      setSalvandoForm(false);
      setErroForm(err instanceof Error ? err.message : 'Não foi possível salvar a grade horária.');
    }
  }

  // ----------------- Cópia -----------------

  function abrirCopia(grade: GradeHoraria) {
    setGradeParaCopiar(grade);
    setModalCopiaAberto(true);
  }

  function fecharModalCopia() {
    setModalCopiaAberto(false);
    setGradeParaCopiar(null);
  }

  async function confirmarCopia() {
    if (!gradeParaCopiar) return;
    setCopiando(true);
    try {
      await gradeHorariaService.copiar(gradeParaCopiar.id);
      setCopiando(false);
      setModalCopiaAberto(false);
      setGradeParaCopiar(null);
      exibirSucesso('copia');
      carregarGrades();
    } catch {
      setCopiando(false);
    }
  }

  // ----------------- Modal de sucesso -----------------

  function exibirSucesso(tipo: SuccessKind) {
    setSucessoTipo(tipo);
    setModalSucessoAberto(true);
  }

  function fecharModalSucesso() {
    setModalSucessoAberto(false);
    setSucessoTipo(null);
    setGradeRecemCriada(null);
  }

  function visualizarGradeRecemCriada() {
    if (gradeRecemCriada) onVisualizar(gradeRecemCriada);
    fecharModalSucesso();
  }

  const mensagemSucesso =
    sucessoTipo === 'cadastro'
      ? 'Grade horária cadastrada com sucesso!'
      : sucessoTipo === 'edicao'
        ? 'Grade horária editada com sucesso!'
        : sucessoTipo === 'copia'
          ? 'Grade horária copiada com sucesso!'
          : '';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <button type="button" onClick={voltar} className={styles.backLink} aria-label="Voltar">
            ←
          </button>
          <div>
            <h1>Grade Horária</h1>
            <p className={styles.subtitle}>Gerencie as grades da instituição</p>
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
              placeholder="Pesquisar..."
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
          <label>Versão</label>
          <input
            type="number"
            min={0}
            placeholder="0"
            value={filtroVersao}
            onChange={(e) => {
              setFiltroVersao(e.target.value);
              resetarPagina();
            }}
          />
        </div>
        <div className={styles.filterField}>
          <label>Data de Criação</label>
          <input
            type="date"
            value={filtroData}
            onChange={(e) => {
              setFiltroData(e.target.value);
              resetarPagina();
            }}
          />
        </div>
        <div className={styles.filterField}>
          <label>Curso Vinculado</label>
          <select
            value={filtroCurso}
            onChange={(e) => {
              setFiltroCurso(e.target.value);
              resetarPagina();
            }}
          >
            <option value="">Selecione...</option>
            {CURSOS_MOCK.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterField}>
          <label>Período Letivo</label>
          <select
            value={filtroPeriodoLetivo}
            onChange={(e) => {
              setFiltroPeriodoLetivo(e.target.value);
              resetarPagina();
            }}
          >
            <option value="">Selecione...</option>
            {PERIODOS_LETIVOS_MOCK.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <button type="button" className={`${styles.btnPrimary} ${styles.btnLimpar}`} onClick={limparFiltros}>
          Limpar filtros
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Versão</th>
              <th>Data de Criação</th>
              <th>Curso Vinculado</th>
              <th>Período Letivo</th>
              <th>Status</th>
              <th className={styles.colAcoes}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {gradesPaginaAtual.map((grade) => (
              <tr key={grade.id}>
                <td>{formatarVersao(grade.versao)}</td>
                <td>{formatarData(grade.dataCriacao)}</td>
                <td>{grade.cursoNome}</td>
                <td>{grade.periodoLetivo}</td>
                <td>
                  {grade.status === 'ativo' ? (
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
                    onClick={() => onVisualizar(grade)}
                    aria-label="Visualizar grade"
                    title="Visualizar grade"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                      <rect x="3.5" y="3.5" width="17" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M3.5 9.5h17M9.5 3.5v17" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={styles.iconAction}
                    onClick={() => abrirEdicao(grade)}
                    aria-label="Editar grade"
                    title="Editar grade"
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
                  <button
                    type="button"
                    className={styles.iconAction}
                    onClick={() => abrirCopia(grade)}
                    aria-label="Copiar grade"
                    title="Copiar grade"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                      <rect x="8.5" y="8.5" width="11" height="11" rx="1.8" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M15.5 8.5V6a1.8 1.8 0 0 0-1.8-1.8H6A1.8 1.8 0 0 0 4.2 6v7.7A1.8 1.8 0 0 0 6 15.5h2.5" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}

            {!carregando && gradesPaginaAtual.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  Nenhuma grade horária encontrada para os filtros informados.
                </td>
              </tr>
            )}
            {carregando && (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  Carregando grades horárias...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        totalItems={gradesFiltradas.length}
        pageSize={itensPorPagina}
        currentPage={paginaAtual}
        onPageChange={setPaginaAtual}
        onPageSizeChange={(size) => {
          setItensPorPagina(size);
          resetarPagina();
        }}
      />

      <GradeHorariaFormModal
        open={modalFormAberto}
        grade={gradeSelecionada}
        loading={salvandoForm}
        serverError={erroForm}
        onConfirm={salvarGrade}
        onCancel={fecharModalForm}
      />

      <ConfirmModal
        open={modalCopiaAberto}
        title="Copiar Grade"
        message="Tem certeza que deseja copiar esta grade?"
        loading={copiando}
        onConfirm={confirmarCopia}
        onCancel={fecharModalCopia}
      />

      <SuccessModal
        open={modalSucessoAberto}
        message={mensagemSucesso}
        onClose={fecharModalSucesso}
        actionLabel={sucessoTipo === 'cadastro' ? 'VISUALIZAR GRADE' : undefined}
        onAction={sucessoTipo === 'cadastro' ? visualizarGradeRecemCriada : undefined}
      />
    </div>
  );
}