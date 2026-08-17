'use client';

import { GradeHoraria } from '@/models/grade-horaria';
import styles from './GradeHorariaVisualizacao.module.css';

interface GradeHorariaVisualizacaoProps {
  grade: GradeHoraria;
  onVoltar: () => void;
}

// Horários e dias fixos, exatamente como no protótipo (nenhuma aula
// alocada ainda — por isso toda célula mostra só o "+").
const HORARIOS = ['13:20 - 14:10', '14:10 - 15:00', '15:10 - 16:00', '16:00 - 16:50', '17:00 - 17:50', '17:50 - 18:40'];
const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function GradeHorariaVisualizacao({ grade, onVoltar }: GradeHorariaVisualizacaoProps) {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button type="button" onClick={onVoltar} className={styles.backLink} aria-label="Voltar">
          ←
        </button>
        <h1>Visualização de Grade</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.infoPanel}>
          <span className={styles.infoTitle}>Informações:</span>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Versão:</span>
            <span className={styles.infoValue}>{String(grade.versao).padStart(2, '0')}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Curso:</span>
            <span className={styles.infoValue}>{grade.cursoNome}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Período Letivo:</span>
            <span className={styles.infoValue}>{grade.periodoLetivo}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Período:</span>
            <span className={styles.infoValue}>{grade.periodo}</span>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Horário</th>
                {DIAS.map((dia) => (
                  <th key={dia}>{dia}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HORARIOS.map((horario) => (
                <tr key={horario}>
                  <td className={styles.colHorario}>{horario}</td>
                  {DIAS.map((dia) => (
                    <td key={dia} className={styles.colSlot}>
                      <button type="button" className={styles.slotBtn} aria-label={`Adicionar aula em ${dia}, ${horario}`}>
                        +
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}