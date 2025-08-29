import type { ExamSection } from '@/types/exam';

export interface ExamOption {
  id: string;
  title: string;
  icon: string;
  sections: ExamSection[];
  description: string;
  estimatedDuration: string;
}

export const EXAM_OPTIONS: ExamOption[] = [
  {
    id: 'complete',
    title: 'Mock Completo',
    icon: 'document-text',
    sections: ['Reading', 'Use of English', 'Listening'],
    description: 'Simulacro completo con todas las secciones',
    estimatedDuration: '45–60 min',
  },
  {
    id: 'listening-only',
    title: 'Solo Listening',
    icon: 'volume-high',
    sections: ['Listening'],
    description: 'Enfocado únicamente en comprensión auditiva',
    estimatedDuration: '20–30 min',
  },
  {
    id: 'reading-only',
    title: 'Solo Reading',
    icon: 'book',
    sections: ['Reading', 'Use of English'],
    description: 'Lectura y uso del inglés',
    estimatedDuration: '30–45 min',
  },
];

export const DEFAULT_SECTIONS: ExamSection[] = ['Reading', 'Use of English', 'Listening'];