'use client';

import { useEffect, useMemo, useState } from 'react';
import { Horario, HorarioPayload } from '@/models/horario';
import * as horarioService from '@/services/horarioService';
import HorarioFormModal from '../HorarioFormModal/HorarioFormModal';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import SuccessModal from '../SuccessModal/SuccessModal';
import Pagination from '../Pagination/Pagination';
import styles from './Horarios.module.css';

type SuccessKind = 'cadastro' | 'edicao' | 'exclusao' | null;

export default function Horarios() {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [carregando, setCarregando] = useState(false);

  // Pesquisa e filtros
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [filtroHoraInicio, setFiltroHoraInicio] = useState('');
  const [filtroHoraFim, setFiltroHoraFim] = useState('');

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(6);

  // Seleção (para exclusão em lote)
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());

  // Modal de cadastro/edição
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [horarioSelecionado, setHorarioSelecionado] = useState<Horario | null>(null);
  const [salvandoForm, setSalvandoForm] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  // Modal de exclusão (serve tanto para 1 item quanto para vários selecionados)
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [idsParaExcluir, setIdsParaExcluir] = useState<number[]>([]);
  const [excluindo, setExcluindo] = useState(false);

  // Modal de sucesso
  const [modalSucessoAberto, setModalSucessoAberto] = useState(false);
  const [sucessoTipo, setSucessoTipo] = useState<SuccessKind>(null);
  const [sucessoQuantidade, setSucessoQuantidade] = useState(1);

  useEffect(() => {
    carregarHorarios();
  }, []);

  function carregarHorarios() {
    setCarregando(true);
    horarioService
      .listar()
      .then(setHorarios)
      .finally(() => setCarregando(false));
  }

  // ----------------- Pesquisa + Filtros -----------------

  const horariosFiltrados = useMemo(() => {
    const termo = termoPesquisa.trim().toLowerCase();

    return horarios.filter((h) => {
      const combinaTermo =
        !termo || h.horaInicio.toLowerCase().includes(termo) || h.horaFim.toLowerCase().includes(termo);

      const combinaFiltroInicio = !filtroHoraInicio || h.horaInicio >= filtroHoraInicio;
      const combinaFiltroFim = !filtroHoraFim || h.horaFim <= filtroHoraFim;

      return combinaTermo && combinaFiltroInicio && combinaFiltroFim;
    });
  }, [horarios, termoPesquisa, filtroHoraInicio, filtroHoraFim]);

  const horariosPaginaAtual = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return horariosFiltrados.slice(inicio, inicio + itensPorPagina);
  }, [horariosFiltrados, paginaAtual, itensPorPagina]);

  function handlePesquisaChange(valor: string) {
    setTermoPesquisa(valor);
    setPaginaAtual(1);
  }

  function handleFiltroHoraInicioChange(valor: string) {
    setFiltroHoraInicio(valor);
    setPaginaAtual(1);
  }

  function handleFiltroHoraFimChange(valor: string) {
    setFiltroHoraFim(valor);
    setPaginaAtual(1);
  }

  function limparFiltros() {
    setFiltroHoraInicio('');
    setFiltroHoraFim('');
    setPaginaAtual(1);
  }

  function handlePageSizeChange(tamanho: number) {
    setItensPorPagina(tamanho);
    setPaginaAtual(1);
  }

  // ----------------- Seleção (exclusão em lote) -----------------

  const todosDaPaginaSelecionados =
    horariosPaginaAtual.length > 0 && horariosPaginaAtual.every((h) => selecionados.has(h.id));

  const algumDaPaginaSelecionado = horariosPaginaAtual.some((h) => selecionados.has(h.id));

  function toggleSelecionado(id: number) {
    setSelecionados((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  }

  function toggleSelecionarTodosDaPagina() {
    setSelecionados((prev) => {
      const novo = new Set(prev);
      if (todosDaPaginaSelecionados) {
        horariosPaginaAtual.forEach((h) => novo.delete(h.id));
      } else {
        horariosPaginaAtual.forEach((h) => novo.add(h.id));
      }
      return novo;
    });
  }

  function limparSelecao() {
    setSelecionados(new Set());
  }

  // ----------------- Cadastro / Edição -----------------

  function abrirCadastro() {
    setHorarioSelecionado(null);
    setErroForm(null);
    setModalFormAberto(true);
  }

  function abrirEdicao(horario: Horario) {
    setHorarioSelecionado(horario);
    setErroForm(null);
    setModalFormAberto(true);
  }

  function fecharModalForm() {
    setModalFormAberto(false);
    setHorarioSelecionado(null);
    setErroForm(null);
  }

  async function salvarHorario(payload: HorarioPayload) {
    setSalvandoForm(true);
    setErroForm(null);

    const tipo: SuccessKind = horarioSelecionado ? 'edicao' : 'cadastro';

    try {
      if (horarioSelecionado) {
        await horarioService.editar(horarioSelecionado.id, payload);
      } else {
        await horarioService.criar(payload);
      }
      setSalvandoForm(false);
      setModalFormAberto(false);
      setHorarioSelecionado(null);
      exibirSucesso(tipo, 1);
      carregarHorarios();
    } catch (err) {
      setSalvandoForm(false);
      setErroForm(err instanceof Error ? err.message : 'Não foi possível salvar o horário.');
    }
  }

  // ----------------- Exclusão (individual ou em lote) -----------------

  function abrirExclusao(horario: Horario) {
    setIdsParaExcluir([horario.id]);
    setModalExclusaoAberto(true);
  }

  function abrirExclusaoSelecionados() {
    if (selecionados.size === 0) return;
    setIdsParaExcluir(Array.from(selecionados));
    setModalExclusaoAberto(true);
  }

  function fecharModalExclusao() {
    setModalExclusaoAberto(false);
    setIdsParaExcluir([]);
  }

  async function confirmarExclusao() {
    if (idsParaExcluir.length === 0) return;
    setExcluindo(true);
    try {
      await horarioService.excluirVarios(idsParaExcluir);
      const quantidade = idsParaExcluir.length;
      setExcluindo(false);
      setModalExclusaoAberto(false);
      setSelecionados((prev) => {
        const novo = new Set(prev);
        idsParaExcluir.forEach((id) => novo.delete(id));
        return novo;
      });
      setIdsParaExcluir([]);
      exibirSucesso('exclusao', quantidade);
      carregarHorarios();
    } catch {
      setExcluindo(false);
    }
  }

  const mensagemConfirmacaoExclusao =
    idsParaExcluir.length > 1
      ? `Tem certeza que deseja excluir os ${idsParaExcluir.length} horários selecionados?`
      : 'Tem certeza que deseja excluir este Horário?';

  // ----------------- Modal de Sucesso -----------------

  function exibirSucesso(tipo: SuccessKind, quantidade: number) {
    setSucessoTipo(tipo);
    setSucessoQuantidade(quantidade);
    setModalSucessoAberto(true);
  }

  function fecharModalSucesso() {
    setModalSucessoAberto(false);
    setSucessoTipo(null);
  }

  const mensagemSucesso = useMemo(() => {
    if (!sucessoTipo) return '';
    if (sucessoTipo === 'cadastro') return 'Horário cadastrado com sucesso!';
    if (sucessoTipo === 'edicao') return 'Horário editado com sucesso!';
    // exclusao
    return sucessoQuantidade > 1
      ? `${sucessoQuantidade} horários excluídos com sucesso!`
      : 'Horário excluído com sucesso!';
  }, [sucessoTipo, sucessoQuantidade]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Listagem de horários</h1>

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
              onChange={(e) => handlePesquisaChange(e.target.value)}
            />
          </div>

          <button type="button" className={styles.btnPrimary} onClick={abrirCadastro}>
            <span className={styles.plus}>+</span> Cadastrar
          </button>
        </div>
      </div>

      <div className={styles.filtersBar}>
        <div className={styles.filterField}>
          <label>Horário Início</label>
          <input
            type="time"
            value={filtroHoraInicio}
            onChange={(e) => handleFiltroHoraInicioChange(e.target.value)}
          />
        </div>
        <div className={styles.filterField}>
          <label>Horário Fim</label>
          <input
            type="time"
            value={filtroHoraFim}
            onChange={(e) => handleFiltroHoraFimChange(e.target.value)}
          />
        </div>

        <button type="button" className={`${styles.btnPrimary} ${styles.btnLimpar}`} onClick={limparFiltros}>
          Limpar filtros
        </button>
      </div>

      {selecionados.size > 0 && (
        <div className={styles.bulkBar}>
          <span>
            {selecionados.size} {selecionados.size === 1 ? 'horário selecionado' : 'horários selecionados'}
          </span>
          <div className={styles.bulkActions}>
            <button type="button" className={styles.btnBulkClear} onClick={limparSelecao}>
              Limpar seleção
            </button>
            <button type="button" className={styles.btnBulkDelete} onClick={abrirExclusaoSelecionados}>
              Excluir selecionados
            </button>
          </div>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colCheckbox}>
                <input
                  type="checkbox"
                  checked={todosDaPaginaSelecionados}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = !todosDaPaginaSelecionados && algumDaPaginaSelecionado;
                    }
                  }}
                  onChange={toggleSelecionarTodosDaPagina}
                  aria-label="Selecionar todos desta página"
                />
              </th>
              <th>Início</th>
              <th>Fim</th>
              <th>Duração</th>
              <th className={styles.colAcoes}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {horariosPaginaAtual.map((horario) => (
              <tr key={horario.id} className={selecionados.has(horario.id) ? styles.rowSelected : ''}>
                <td className={styles.colCheckbox}>
                  <input
                    type="checkbox"
                    checked={selecionados.has(horario.id)}
                    onChange={() => toggleSelecionado(horario.id)}
                    aria-label={`Selecionar horário ${horario.horaInicio} - ${horario.horaFim}`}
                  />
                </td>
                <td>{horario.horaInicio}</td>
                <td>{horario.horaFim}</td>
                <td>{horario.duracao}</td>
                <td className={styles.colAcoes}>
                  <button
                    type="button"
                    className={`${styles.iconAction} ${styles.edit}`}
                    onClick={() => abrirEdicao(horario)}
                    aria-label="Editar horário"
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
                    className={`${styles.iconAction} ${styles.delete}`}
                    onClick={() => abrirExclusao(horario)}
                    aria-label="Excluir horário"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                      <path
                        d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.8 12.1a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7h12Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}

            {!carregando && horariosPaginaAtual.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  Nenhum horário encontrado para os filtros informados.
                </td>
              </tr>
            )}
            {carregando && (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  Carregando horários...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        totalItems={horariosFiltrados.length}
        pageSize={itensPorPagina}
        currentPage={paginaAtual}
        onPageChange={setPaginaAtual}
        onPageSizeChange={handlePageSizeChange}
      />

      <HorarioFormModal
        open={modalFormAberto}
        horario={horarioSelecionado}
        loading={salvandoForm}
        serverError={erroForm}
        onConfirm={salvarHorario}
        onCancel={fecharModalForm}
      />

      <ConfirmModal
        open={modalExclusaoAberto}
        title={idsParaExcluir.length > 1 ? 'Excluir Horários' : 'Excluir Horário'}
        message={mensagemConfirmacaoExclusao}
        submessage="A ação será irreversível."
        loading={excluindo}
        onConfirm={confirmarExclusao}
        onCancel={fecharModalExclusao}
      />

      <SuccessModal open={modalSucessoAberto} message={mensagemSucesso} onClose={fecharModalSucesso} />
    </div>
  );
}
