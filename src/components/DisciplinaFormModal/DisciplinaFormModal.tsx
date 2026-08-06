'use client';

import { useState } from 'react';
import Modal from '../Modal/Modal';
import ColorPicker from '../ColorPicker/ColorPicker';
import { Curso } from '@/models/curso';
import {
  CORES_DISCIPLINA,
  Disciplina,
  DisciplinaPayload,
  ModalidadeDisciplina,
  PeriodoDisciplina,
  StatusDisciplina,
  TipoDisciplina,
  TipoSala,
} from '@/models/disciplina';
import styles from './DisciplinaFormModal.module.css';

interface DisciplinaFormModalProps {
  open: boolean;
  /** Quando null -> modo cadastro. Quando preenchido -> modo edição. */
  disciplina: Disciplina | null;
  /** Cursos disponíveis para vincular (buscados pela tela, não pelo modal). */
  cursos: Curso[];
  loading?: boolean;
  serverError?: string | null;
  onConfirm: (payload: DisciplinaPayload) => void;
  onCancel: () => void;
}

const TIPOS: TipoDisciplina[] = ['Prática', 'Teórica', '50/50'];
const PERIODOS: PeriodoDisciplina[] = ['Manhã', 'Tarde', 'Noite'];
const MODALIDADES: ModalidadeDisciplina[] = ['Presencial', 'EAD'];
const TIPOS_SALA: TipoSala[] = ['Laboratório', 'Sala'];

interface FormState {
  nome: string;
  cargaHoraria: string;
  tipo: TipoDisciplina | '';
  periodo: PeriodoDisciplina | '';
  modalidade: ModalidadeDisciplina | '';
  codigo: string;
  cor: string;
  cursoId: string;
  tipoSala: TipoSala | '';
  status: StatusDisciplina;
}

const EMPTY_FORM: FormState = {
  nome: '',
  cargaHoraria: '',
  tipo: '',
  periodo: '',
  modalidade: '',
  codigo: '',
  cor: CORES_DISCIPLINA[0].valor,
  cursoId: '',
  tipoSala: '',
  status: 'ativo',
};

// Ver o comentário em HorarioFormModal.tsx: aqui o "de fora" só decide
// se mostra o formulário (via `open`); quem guarda o estado é o
// DisciplinaFormContent, remontado do zero a cada abertura via a prop `key`.
export default function DisciplinaFormModal({
  open,
  disciplina,
  cursos,
  loading = false,
  serverError = null,
  onConfirm,
  onCancel,
}: DisciplinaFormModalProps) {
  return (
    <Modal open={open} onClose={onCancel} width="560px">
      {open && (
        <DisciplinaFormContent
          key={disciplina?.id ?? 'novo'}
          disciplina={disciplina}
          cursos={cursos}
          loading={loading}
          serverError={serverError}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      )}
    </Modal>
  );
}

interface DisciplinaFormContentProps {
  disciplina: Disciplina | null;
  cursos: Curso[];
  loading: boolean;
  serverError: string | null;
  onConfirm: (payload: DisciplinaPayload) => void;
  onCancel: () => void;
}

function DisciplinaFormContent({
  disciplina,
  cursos,
  loading,
  serverError,
  onConfirm,
  onCancel,
}: DisciplinaFormContentProps) {
  const [form, setForm] = useState<FormState>(() =>
    disciplina
      ? {
          nome: disciplina.nome,
          cargaHoraria: String(disciplina.cargaHoraria),
          tipo: disciplina.tipo,
          periodo: disciplina.periodo,
          modalidade: disciplina.modalidade,
          codigo: String(disciplina.codigo),
          cor: disciplina.cor,
          cursoId: String(disciplina.cursoId),
          tipoSala: disciplina.tipoSala,
          status: disciplina.status,
        }
      : EMPTY_FORM
  );
  const [touched, setTouched] = useState(false);

  const isEdicao = !!disciplina;

  const camposObrigatoriosPreenchidos =
    form.nome.trim() &&
    form.cargaHoraria &&
    form.tipo &&
    form.periodo &&
    form.modalidade &&
    form.codigo &&
    form.cursoId &&
    form.tipoSala;

  function erro(condicao: boolean, mensagem: string) {
    return touched && condicao ? <span className={styles.fieldError}>{mensagem}</span> : null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);

    if (!camposObrigatoriosPreenchidos) {
      return;
    }

    const payload: DisciplinaPayload = {
      nome: form.nome.trim(),
      cargaHoraria: Number(form.cargaHoraria),
      tipo: form.tipo as TipoDisciplina,
      periodo: form.periodo as PeriodoDisciplina,
      modalidade: form.modalidade as ModalidadeDisciplina,
      codigo: Number(form.codigo),
      cor: form.cor,
      cursoId: Number(form.cursoId),
      tipoSala: form.tipoSala as TipoSala,
      status: form.status,
    };
    onConfirm(payload);
  }

  return (
    <>
      <h3 className={styles.title}>Cadastro de disciplina</h3>

      <form onSubmit={handleSubmit}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              type="text"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Enter text here..."
            />
            {erro(!form.nome.trim(), 'Nome é obrigatório.')}
          </div>

          <div className={styles.field}>
            <label htmlFor="cargaHoraria">Carga horária</label>
            <input
              id="cargaHoraria"
              type="number"
              min={0}
              value={form.cargaHoraria}
              onChange={(e) => setForm((f) => ({ ...f, cargaHoraria: e.target.value }))}
            />
            {erro(!form.cargaHoraria, 'Carga horária é obrigatória.')}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="tipo">Tipo da disciplina</label>
            <select
              id="tipo"
              value={form.tipo}
              onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as TipoDisciplina }))}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {erro(!form.tipo, 'Selecione o tipo.')}
          </div>

          <div className={styles.field}>
            <label htmlFor="periodo">Período</label>
            <select
              id="periodo"
              value={form.periodo}
              onChange={(e) => setForm((f) => ({ ...f, periodo: e.target.value as PeriodoDisciplina }))}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {PERIODOS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {erro(!form.periodo, 'Selecione o período.')}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="modalidade">Modalidade</label>
            <select
              id="modalidade"
              value={form.modalidade}
              onChange={(e) => setForm((f) => ({ ...f, modalidade: e.target.value as ModalidadeDisciplina }))}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {MODALIDADES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            {erro(!form.modalidade, 'Selecione a modalidade.')}
          </div>

          <div className={styles.field}>
            <label htmlFor="codigo">Código da disciplina</label>
            <input
              id="codigo"
              type="number"
              min={0}
              value={form.codigo}
              onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
            />
            {erro(!form.codigo, 'Código é obrigatório.')}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Cor</label>
            <ColorPicker value={form.cor} onChange={(cor) => setForm((f) => ({ ...f, cor }))} />
          </div>

          <div className={styles.field}>
            <label htmlFor="cursoId">Curso vinculado</label>
            <select
              id="cursoId"
              value={form.cursoId}
              onChange={(e) => setForm((f) => ({ ...f, cursoId: e.target.value }))}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                  {c.status === 'inativo' ? ' (inativo)' : ''}
                </option>
              ))}
            </select>
            {erro(!form.cursoId, 'Selecione o curso vinculado.')}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="tipoSala">Tipo de sala</label>
            <select
              id="tipoSala"
              value={form.tipoSala}
              onChange={(e) => setForm((f) => ({ ...f, tipoSala: e.target.value as TipoSala }))}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {TIPOS_SALA.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {erro(!form.tipoSala, 'Selecione o tipo de sala.')}
          </div>

          <div className={styles.field}>
            <label>Status</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="status"
                  checked={form.status === 'ativo'}
                  onChange={() => setForm((f) => ({ ...f, status: 'ativo' }))}
                />
                Ativo
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="status"
                  checked={form.status === 'inativo'}
                  onChange={() => setForm((f) => ({ ...f, status: 'inativo' }))}
                />
                Inativo
              </label>
            </div>
          </div>
        </div>

        {serverError && <p className={styles.serverError}>{serverError}</p>}

        <div className={styles.actions}>
          <button type="button" className={styles.btnText} onClick={onCancel}>
            CANCELAR
          </button>
          <button type="submit" className={styles.btnPrimaryBlue} disabled={loading}>
            {isEdicao ? 'CONFIRMAR' : 'CONTINUAR'}
          </button>
        </div>
      </form>
    </>
  );
}
