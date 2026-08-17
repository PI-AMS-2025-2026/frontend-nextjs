'use client';

import { useState } from 'react';
import Modal from '@/components/shared/Modal/Modal';
import {
  CURSOS_MOCK,
  GradeHoraria,
  GradeHorariaPayload,
  PERIODOS_LETIVOS_MOCK,
  StatusGrade,
} from '@/models/grade-horaria';
import styles from './GradeHorariaFormModal.module.css';

interface GradeHorariaFormModalProps {
  open: boolean;
  /** Quando null -> modo cadastro. Quando preenchido -> modo edição. */
  grade: GradeHoraria | null;
  loading?: boolean;
  serverError?: string | null;
  onConfirm: (payload: GradeHorariaPayload) => void;
  onCancel: () => void;
}

interface FormState {
  versao: string;
  dataCriacao: string;
  cursoNome: string;
  periodoLetivo: string;
  status: StatusGrade;
}

const EMPTY_FORM: FormState = {
  versao: '',
  dataCriacao: '',
  cursoNome: '',
  periodoLetivo: '',
  status: 'ativo',
};

// Ver o comentário em outros *FormModal do projeto: o componente "de fora"
// só decide SE mostra o form (via `open`); quem guarda o estado é o
// FormContent, remontado do zero a cada abertura via a prop `key` — assim
// não precisa de useEffect pra resetar o form manualmente.
export default function GradeHorariaFormModal({
  open,
  grade,
  loading = false,
  serverError = null,
  onConfirm,
  onCancel,
}: GradeHorariaFormModalProps) {
  return (
    <Modal open={open} onClose={onCancel} width="520px">
      {open && (
        <FormContent
          key={grade?.id ?? 'novo'}
          grade={grade}
          loading={loading}
          serverError={serverError}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      )}
    </Modal>
  );
}

function FormContent({
  grade,
  loading,
  serverError,
  onConfirm,
  onCancel,
}: {
  grade: GradeHoraria | null;
  loading: boolean;
  serverError: string | null;
  onConfirm: (payload: GradeHorariaPayload) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(() =>
    grade
      ? {
          versao: String(grade.versao),
          dataCriacao: grade.dataCriacao,
          cursoNome: grade.cursoNome,
          periodoLetivo: grade.periodoLetivo,
          status: grade.status,
        }
      : EMPTY_FORM
  );
  const [touched, setTouched] = useState(false);

  const isEdicao = !!grade;

  const camposOk =
    form.versao.trim() && form.dataCriacao && form.cursoNome && form.periodoLetivo;

  function erro(condicao: boolean, mensagem: string) {
    return touched && condicao ? <span className={styles.fieldError}>{mensagem}</span> : null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!camposOk) return;

    onConfirm({
      versao: Number(form.versao),
      dataCriacao: form.dataCriacao,
      cursoNome: form.cursoNome,
      periodoLetivo: form.periodoLetivo,
      status: form.status,
    });
  }

  return (
    <>
      <h3 className={styles.title}>{isEdicao ? 'Edição de Grade Horária' : 'Cadastro de Grade Horária'}</h3>

      <form onSubmit={handleSubmit}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="versao">Versão</label>
            <input
              id="versao"
              type="number"
              min={0}
              value={form.versao}
              onChange={(e) => setForm((f) => ({ ...f, versao: e.target.value }))}
              placeholder="0"
            />
            {erro(!form.versao.trim(), 'Versão é obrigatória.')}
          </div>

          <div className={styles.field}>
            <label htmlFor="dataCriacao">Data de Criação</label>
            <input
              id="dataCriacao"
              type="date"
              value={form.dataCriacao}
              onChange={(e) => setForm((f) => ({ ...f, dataCriacao: e.target.value }))}
            />
            {erro(!form.dataCriacao, 'Data de criação é obrigatória.')}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="cursoNome">Curso Vinculado</label>
            <select
              id="cursoNome"
              value={form.cursoNome}
              onChange={(e) => setForm((f) => ({ ...f, cursoNome: e.target.value }))}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {CURSOS_MOCK.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {erro(!form.cursoNome, 'Selecione o curso vinculado.')}
          </div>

          <div className={styles.field}>
            <label htmlFor="periodoLetivo">Período Letivo</label>
            <select
              id="periodoLetivo"
              value={form.periodoLetivo}
              onChange={(e) => setForm((f) => ({ ...f, periodoLetivo: e.target.value }))}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {PERIODOS_LETIVOS_MOCK.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {erro(!form.periodoLetivo, 'Selecione o período letivo.')}
          </div>
        </div>

        <div className={styles.row}>
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
            CONFIRMAR
          </button>
        </div>
      </form>
    </>
  );
}