export interface Horario {
  id: number;
  horaInicio: string; // formato HH:mm
  horaFim: string; // formato HH:mm
  duracao: string; // calculado - formato HH:mm
}

// Payload utilizado para criação/edição (sem id e sem duração,
// já que a duração é sempre recalculada pelo serviço/backend)
export type HorarioPayload = Omit<Horario, 'id' | 'duracao'>;
