// types/exam.ts
import type { ExamLevel } from '@/types/level';

export type CEFRLevel = 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Secciones que usamos en la app/web actual.
 * (Nómbrelas tal y como las mostramos al usuario para evitar mapeos innecesarios)
 */
export type ExamSection =
  | 'Reading'
  | 'Use of English'
  | 'Listening'
  | 'Writing'
  | 'Speaking';

export type ExamItem = {
  id: string;
  type: 'mcq' | 'gap' | 'open';
  prompt: string;
  options?: string[]; // para mcq
  answer?: any; // solución (mock/autocorrección)
  section: ExamSection;
  points?: number;
};

/**
 * Tipo base de examen que viaja por toda la app (mock o edge).
 */
export type Exam = {
  id: string;
  title: string;
  level?: ExamLevel;       // <- importante para adaptar dificultad
  sections?: ExamSection[]; // opcional (algunos mocks la incluyen)
  items: ExamItem[];
  createdAt?: number;
};

// Compat: si en algún sitio estaban usando "ExamMock", que apunte a Exam
export type ExamMock = Exam;
