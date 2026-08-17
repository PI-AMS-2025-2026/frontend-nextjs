'use client';

import { useState } from 'react';
import GradeHorariaListagem from '../GradeHorariaListagem/GradeHorariaListagem';
import GradeHorariaVisualizacao from '../GradeHorariaVisualizacao/GradeHorariaVisualizacao';
import { GradeHoraria as GradeHorariaModel } from '@/models/grade-horaria';

type View = { tela: 'listagem' } | { tela: 'visualizacao'; grade: GradeHorariaModel };

/**
 * Componente "raiz" do módulo de Grade Horária. Alterna entre a listagem e
 * a visualização de uma grade específica usando estado local — não depende
 * de rota nenhuma do Next.js. Se um dia vocês quiserem URLs reais (tipo
 * /grade-horaria e /grade-horaria/[id]), é só criar duas páginas: uma
 * renderiza <GradeHorariaListagem onVisualizar={(g) => router.push(...)} />
 * e a outra <GradeHorariaVisualizacao grade={...} onVoltar={() => router.back()} />.
 */
export default function GradeHoraria() {
  const [view, setView] = useState<View>({ tela: 'listagem' });

  if (view.tela === 'visualizacao') {
    return (
      <GradeHorariaVisualizacao grade={view.grade} onVoltar={() => setView({ tela: 'listagem' })} />
    );
  }

  return <GradeHorariaListagem onVisualizar={(grade) => setView({ tela: 'visualizacao', grade })} />;
}