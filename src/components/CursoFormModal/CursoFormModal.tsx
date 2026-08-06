'use client';

import { useState } from 'react';
import Modal from '../Modal/Modal';
import { Curso, CursoPayload, Periodicidade, StatusCurso } from '@/models/curso';
import styles from './CursoFormModal.module.css';

interface CursoFormModalProps {
  open: boolean;
  /** Quando null -> modo cadastro. Quando preenchido -> modo edição. */
  curso: Curso | null;
  loading?: boolean;
  serverError?: string | null;
  onConfirm: (payload: CursoPayload) => void;
  onCancel: () => void;
}

const PERIODICIDADES: Periodicidade[] = ['Bimestral', 'Trimestral', 'Semestral', 'Anual'];

interface FormState {
  nome: string;
  periodicidade: Periodicidade | '';
  duracao: string;
  status: StatusCurso;
}

const EMPTY_FORM: FormState = {
  nome: '',
  periodicidade: '',
  duracao: '',
  status: 'ativo',
};

// Ver o comentário em HorarioFormModal.tsx: aqui o "de fora" só decide
// se mostra o formulário (via `open`); quem guarda o estado é o
// CursoFormContent, remontado do zero a cada abertura via a prop `key`.
export default function CursoFormModal({
  open,
  curso,
  loading = false,
  serverError = null,
  onConfirm,
  onCancel,
}: CursoFormModalProps) {
  return (
    <Modal open={open} onClose={onCancel} width="520px">
      {open && (
        <CursoFormContent
          key={curso?.id ?? 'novo'}
          curso={curso}
          loading={loading}
          serverError={serverError}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      )}
    </Modal>
  );
}

interface CursoFormContentProps {
  curso: Curso | null;
  loading: boolean;
  serverError: string | null;
  onConfirm: (payload: CursoPayload) => void;
  onCancel: () => void;
}

function CursoFormContent({ curso, loading, serverError, onConfirm, onCancel }: CursoFormContentProps) {
  const [form, setForm] = useState<FormState>(() =>
    curso
      ? { nome: curso.nome, periodicidade: curso.periodicidade, duracao: curso.duracao, status: curso.status }
      : EMPTY_FORM
  );
  const [touched, setTouched] = useState(false);

  const isEdicao = !!curso;

  const nomeInvalido = touched && !form.nome.trim();
  const periodicidadeInvalida = touched && !form.periodicidade;
  const duracaoInvalida = touched && !form.duracao.trim();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);

    if (!form.nome.trim() || !form.periodicidade || !form.duracao.trim()) {
      return;
    }

    onConfirm({
      nome: form.nome.trim(),
      periodicidade: form.periodicidade,
      duracao: form.duracao.trim(),
      status: form.status,
    });
  }

  return (
    <>
      <h3 className={styles.title}>{isEdicao ? 'Edição de Curso' : 'Cadastro de Curso'}</h3>

      <form onSubmit={handleSubmit}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="nome">Nome do Curso</label>
            <input
              id="nome"
              type="text"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Enter text here..."
            />
            {nomeInvalido && <span className={styles.fieldError}>Nome é obrigatório.</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="periodicidade">Periodicidade</label>
            <select
              id="periodicidade"
              value={form.periodicidade}
              onChange={(e) => setForm((f) => ({ ...f, periodicidade: e.target.value as Periodicidade }))}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {PERIODICIDADES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {periodicidadeInvalida && <span className={styles.fieldError}>Selecione uma periodicidade.</span>}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="duracao">Duração</label>
            <input
              id="duracao"
              type="text"
              value={form.duracao}
              onChange={(e) => setForm((f) => ({ ...f, duracao: e.target.value }))}
              placeholder="Ex: 3 anos"
            />
            {duracaoInvalida && <span className={styles.fieldError}>Duração é obrigatória.</span>}
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
            CONFIRMAR
          </button>
        </div>
      </form>
    </>
  );
}
