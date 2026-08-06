'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Curso } from '@/models/curso';
import {
  CORES_DISCIPLINA,
  Disciplina,
  DisciplinaPayload,
  ModalidadeDisciplina,
  PeriodoDisciplina,
  TipoDisciplina,
  TipoSala,
} from '@/models/disciplina';
import * as cursoService from '@/services/cursoService';
import * as disciplinaService from '@/services/disciplinaService';
import ColumnFilter from '../ColumnFilter/ColumnFilter';
import DisciplinaFormModal from '../DisciplinaFormModal/DisciplinaFormModal';
import SuccessModal from '../SuccessModal/SuccessModal';
import Pagination from '../Pagination/Pagination';
import styles from './Disciplinas.module.css';

type SuccessKind = 'cadastro' | 'edicao' | null;

const TIPOS: TipoDisciplina[] = ['Prática', 'Teórica', '50/50'];
const PERIODOS: PeriodoDisciplina[] = ['Manhã', 'Tarde', 'Noite'];
const MODALIDADES: ModalidadeDisciplina[] = ['Presencial', 'EAD'];
const TIPOS_SALA: TipoSala[] = ['Laboratório', 'Sala'];
const STATUS_OPCOES = ['Ativo', 'Inativo'];

interface Filtros {
  nome: string;
  cargaHoraria: string;
  tipo: string[];
  periodo: string[];
  modalidade: string[];
  codigo: string;
  cor: string[]; // nomes das cores (ex: "Laranja"), não os hex
  cursoNome: string[];
  tipoSala: string[];
  status: string[]; // "Ativo" | "Inativo"
}

const FILTROS_VAZIOS: Filtros = {
  nome: '',
  cargaHoraria: '',
  tipo: [],
  periodo: [],
  modalidade: [],
  codigo: '',
  cor: [],
  cursoNome: [],
  tipoSala: [],
  status: [],
};

export default function Disciplinas() {
  const router = useRouter();
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [carregando, setCarregando] = useState(false);

  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VAZIOS);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(8);

  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState<Disciplina | null>(null);
  const [salvandoForm, setSalvandoForm] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  const [modalSucessoAberto, setModalSucessoAberto] = useState(false);
  const [sucessoTipo, setSucessoTipo] = useState<SuccessKind>(null);

  useEffect(() => {
    carregarTudo();
  }, []);

  function carregarTudo() {
    setCarregando(true);
    Promise.all([disciplinaService.listar(), cursoService.listar()])
      .then(([listaDisciplinas, listaCursos]) => {
        setDisciplinas(listaDisciplinas);
        setCursos(listaCursos);
      })
      .finally(() => setCarregando(false));
  }

  // Mapa id -> curso, pra não ficar fazendo .find() dentro do render da tabela
  const cursosPorId = useMemo(() => new Map(cursos.map((c) => [c.id, c])), [cursos]);
  const nomeCor = useMemo(
    () => new Map<string, string>(CORES_DISCIPLINA.map((c) => [c.valor, c.nome])),
    []
  );

  function resetarPagina() {
    setPaginaAtual(1);
  }

  function atualizarFiltro<K extends keyof Filtros>(campo: K, valor: Filtros[K]) {
    setFiltros((f) => ({ ...f, [campo]: valor }));
    resetarPagina();
  }

  function limparFiltros() {
    setFiltros(FILTROS_VAZIOS);
    setTermoPesquisa('');
    resetarPagina();
  }

  const disciplinasFiltradas = useMemo(() => {
    const termo = termoPesquisa.trim().toLowerCase();

    return disciplinas.filter((d) => {
      const curso = cursosPorId.get(d.cursoId);
      const nomeCurso = curso?.nome ?? '';
      const corNome = nomeCor.get(d.cor) ?? '';
      const statusLabel = d.status === 'ativo' ? 'Ativo' : 'Inativo';

      const combinaTermo =
        !termo ||
        d.nome.toLowerCase().includes(termo) ||
        String(d.codigo).includes(termo) ||
        nomeCurso.toLowerCase().includes(termo);

      const combinaNome = !filtros.nome || d.nome.toLowerCase().includes(filtros.nome.toLowerCase());
      const combinaCarga = !filtros.cargaHoraria || String(d.cargaHoraria).includes(filtros.cargaHoraria);
      const combinaTipo = filtros.tipo.length === 0 || filtros.tipo.includes(d.tipo);
      const combinaPeriodo = filtros.periodo.length === 0 || filtros.periodo.includes(d.periodo);
      const combinaModalidade = filtros.modalidade.length === 0 || filtros.modalidade.includes(d.modalidade);
      const combinaCodigo = !filtros.codigo || String(d.codigo).includes(filtros.codigo);
      const combinaCor = filtros.cor.length === 0 || filtros.cor.includes(corNome);
      const combinaCurso = filtros.cursoNome.length === 0 || filtros.cursoNome.includes(nomeCurso);
      const combinaTipoSala = filtros.tipoSala.length === 0 || filtros.tipoSala.includes(d.tipoSala);
      const combinaStatus = filtros.status.length === 0 || filtros.status.includes(statusLabel);

      return (
        combinaTermo &&
        combinaNome &&
        combinaCarga &&
        combinaTipo &&
        combinaPeriodo &&
        combinaModalidade &&
        combinaCodigo &&
        combinaCor &&
        combinaCurso &&
        combinaTipoSala &&
        combinaStatus
      );
    });
  }, [disciplinas, termoPesquisa, filtros, cursosPorId, nomeCor]);

  const disciplinasPaginaAtual = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return disciplinasFiltradas.slice(inicio, inicio + itensPorPagina);
  }, [disciplinasFiltradas, paginaAtual, itensPorPagina]);

  const nomesDosCursos = useMemo(() => cursos.map((c) => c.nome), [cursos]);
  const nomesDasCores = useMemo(() => CORES_DISCIPLINA.map((c) => c.nome), []);

  // ----------------- Cadastro / Edição -----------------

  function abrirCadastro() {
    setDisciplinaSelecionada(null);
    setErroForm(null);
    setModalFormAberto(true);
  }

  function abrirEdicao(disciplina: Disciplina) {
    setDisciplinaSelecionada(disciplina);
    setErroForm(null);
    setModalFormAberto(true);
  }

  function fecharModalForm() {
    setModalFormAberto(false);
    setDisciplinaSelecionada(null);
    setErroForm(null);
  }

  async function salvarDisciplina(payload: DisciplinaPayload) {
    setSalvandoForm(true);
    setErroForm(null);

    const tipo: SuccessKind = disciplinaSelecionada ? 'edicao' : 'cadastro';

    try {
      if (disciplinaSelecionada) {
        await disciplinaService.editar(disciplinaSelecionada.id, payload);
      } else {
        await disciplinaService.criar(payload);
      }
      setSalvandoForm(false);
      setModalFormAberto(false);
      setDisciplinaSelecionada(null);
      exibirSucesso(tipo);
      carregarTudo();
    } catch (err) {
      setSalvandoForm(false);
      setErroForm(err instanceof Error ? err.message : 'Não foi possível salvar a disciplina.');
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
  }

  const mensagemSucesso =
    sucessoTipo === 'cadastro'
      ? 'Disciplina cadastrada com sucesso!'
      : sucessoTipo === 'edicao'
        ? 'Disciplina editada com sucesso!'
        : '';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <button type="button" onClick={() => router.back()} className={styles.backLink} aria-label="Voltar">
            ←
          </button>
          <div>
            <h1>Disciplinas</h1>
            <p className={styles.subtitle}>Gerencie as disciplinas da instituição</p>
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

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <ColumnFilter
                  label="Nome"
                  kind="text"
                  value={filtros.nome}
                  onChange={(v) => atualizarFiltro('nome', v)}
                  placeholder="Filtrar por nome"
                />
              </th>
              <th>
                <ColumnFilter
                  label="Carga horária"
                  kind="text"
                  value={filtros.cargaHoraria}
                  onChange={(v) => atualizarFiltro('cargaHoraria', v)}
                  placeholder="Ex: 80"
                />
              </th>
              <th>
                <ColumnFilter
                  label="Tipo"
                  kind="select"
                  options={TIPOS}
                  selected={filtros.tipo}
                  onChange={(v) => atualizarFiltro('tipo', v)}
                />
              </th>
              <th>
                <ColumnFilter
                  label="Período"
                  kind="select"
                  options={PERIODOS}
                  selected={filtros.periodo}
                  onChange={(v) => atualizarFiltro('periodo', v)}
                />
              </th>
              <th>
                <ColumnFilter
                  label="Modalidade"
                  kind="select"
                  options={MODALIDADES}
                  selected={filtros.modalidade}
                  onChange={(v) => atualizarFiltro('modalidade', v)}
                />
              </th>
              <th>
                <ColumnFilter
                  label="Código"
                  kind="text"
                  value={filtros.codigo}
                  onChange={(v) => atualizarFiltro('codigo', v)}
                  placeholder="Ex: 102"
                />
              </th>
              <th>
                <ColumnFilter
                  label="Cor"
                  kind="select"
                  options={nomesDasCores}
                  selected={filtros.cor}
                  onChange={(v) => atualizarFiltro('cor', v)}
                />
              </th>
              <th>
                <ColumnFilter
                  label="Curso vinculado"
                  kind="select"
                  options={nomesDosCursos}
                  selected={filtros.cursoNome}
                  onChange={(v) => atualizarFiltro('cursoNome', v)}
                />
              </th>
              <th>
                <ColumnFilter
                  label="Tipo de sala"
                  kind="select"
                  options={TIPOS_SALA}
                  selected={filtros.tipoSala}
                  onChange={(v) => atualizarFiltro('tipoSala', v)}
                />
              </th>
              <th>
                <ColumnFilter
                  label="Status"
                  kind="select"
                  options={STATUS_OPCOES}
                  selected={filtros.status}
                  onChange={(v) => atualizarFiltro('status', v)}
                />
              </th>
              <th className={styles.colAcoes}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {disciplinasPaginaAtual.map((disciplina) => {
              const curso = cursosPorId.get(disciplina.cursoId);
              return (
                <tr key={disciplina.id}>
                  <td>{disciplina.nome}</td>
                  <td>{disciplina.cargaHoraria}h</td>
                  <td>{disciplina.tipo}</td>
                  <td>{disciplina.periodo}</td>
                  <td>{disciplina.modalidade}</td>
                  <td>{disciplina.codigo}</td>
                  <td>
                    <span className={styles.corSwatch} style={{ background: disciplina.cor }} />
                  </td>
                  <td className={styles.colCurso} title={curso ? curso.nome : undefined}>
                    {curso ? curso.nome : '—'}
                  </td>
                  <td>{disciplina.tipoSala}</td>
                  <td>
                    {disciplina.status === 'ativo' ? (
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
                      onClick={() => abrirEdicao(disciplina)}
                      aria-label="Editar disciplina"
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
              );
            })}

            {!carregando && disciplinasPaginaAtual.length === 0 && (
              <tr>
                <td colSpan={11} className={styles.emptyState}>
                  Nenhuma disciplina encontrada para os filtros informados.
                </td>
              </tr>
            )}
            {carregando && (
              <tr>
                <td colSpan={11} className={styles.emptyState}>
                  Carregando disciplinas...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.footerBar}>
        <button type="button" className={styles.btnLimparAbaixo} onClick={limparFiltros}>
          Limpar todos os filtros
        </button>

        <Pagination
          totalItems={disciplinasFiltradas.length}
          pageSize={itensPorPagina}
          currentPage={paginaAtual}
          pageSizeOptions={[8, 16, 30, 50]}
          onPageChange={setPaginaAtual}
          onPageSizeChange={(size) => {
            setItensPorPagina(size);
            resetarPagina();
          }}
        />
      </div>

      <DisciplinaFormModal
        open={modalFormAberto}
        disciplina={disciplinaSelecionada}
        cursos={cursos}
        loading={salvandoForm}
        serverError={erroForm}
        onConfirm={salvarDisciplina}
        onCancel={fecharModalForm}
      />

      <SuccessModal open={modalSucessoAberto} message={mensagemSucesso} onClose={fecharModalSucesso} />
    </div>
  );
}