'use client';

import { useEffect, useState } from 'react';
import Modal from '../Modal/Modal';
import { Horario, HorarioPayload } from '@/models/horario';
import { calcularDuracao } from '@/services/horarioService';
import styles from './HorarioFormModal.module.css';

interface HorarioFormModalProps {
  open: boolean;
  /** Quando null -> modo cadastro. Quando preenchido -> modo edição. */
  horario: Horario | null;
  loading?: boolean;
  /** Mensagem de erro vinda do backend/serviço (ex.: duplicidade) */
  serverError?: string | null;
  onConfirm: (payload: HorarioPayload) => void;
  onCancel: () => void;
}

interface FormState {
  horaInicio: string;
  horaFim: string;
}

interface Touched {
  horaInicio: boolean;
  horaFim: boolean;
}

const EMPTY_FORM: FormState = {
  horaInicio: '',
  horaFim: '',
};

export default function HorarioFormModal({
  open,
  horario,
  loading = false,
  serverError = null,
  onConfirm,
  onCancel,
}: HorarioFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [touched, setTouched] = useState<Touched>({ horaInicio: false, horaFim: false });

  // Reseta/preenche o formulário sempre que o modal é aberto
  useEffect(() => {
    if (!open) return;
    setTouched({ horaInicio: false, horaFim: false });
    if (horario) {
      setForm({
        horaInicio: horario.horaInicio,
        horaFim: horario.horaFim,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, horario]);

  const isEdicao = !!horario;

  const duracao = calcularDuracao(form.horaInicio, form.horaFim);
  const duracaoExibida = !form.horaInicio || !form.horaFim ? '--:--' : duracao || 'Inválida';
  const horaFimInvalida = !!form.horaInicio && !!form.horaFim && !duracao;

  const horaInicioInvalida = touched.horaInicio && !form.horaInicio;
  const horaFimObrigatoriaInvalida = touched.horaFim && !form.horaFim;

  function handleChange<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ horaInicio: true, horaFim: true });

    if (!form.horaInicio || !form.horaFim || horaFimInvalida) {
      return;
    }

    const payload: HorarioPayload = {
      horaInicio: form.horaInicio,
      horaFim: form.horaFim,
    };
    onConfirm(payload);
  }

  return (
    <Modal open={open} onClose={onCancel} width="480px">
      <h3 className={styles.title}>{isEdicao ? 'Editar Horário' : 'Cadastrar Horário'}</h3>

      <form onSubmit={handleSubmit}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="horaInicio">Início</label>
            <input
              id="horaInicio"
              type="time"
              value={form.horaInicio}
              onChange={(e) => handleChange('horaInicio', e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, horaInicio: true }))}
              placeholder="Enter text here..."
            />
            {horaInicioInvalida && (
              <span className={styles.fieldError}>Hora início é obrigatória.</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="horaFim">Fim</label>
            <input
              id="horaFim"
              type="time"
              value={form.horaFim}
              onChange={(e) => handleChange('horaFim', e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, horaFim: true }))}
              placeholder="Enter text here..."
            />
            {horaFimObrigatoriaInvalida && (
              <span className={styles.fieldError}>Hora fim é obrigatória.</span>
            )}
            {!horaFimObrigatoriaInvalida && horaFimInvalida && (
              <span className={styles.fieldError}>Hora fim deve ser maior que hora início.</span>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Duração</label>
            <input type="text" value={duracaoExibida} disabled className={styles.readonlyField} />
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
    </Modal>
  );
}
