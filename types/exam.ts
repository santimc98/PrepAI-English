export type CEFRLevel = 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type ExamSectionType = 'reading' | 'listening' | 'use_of_english' | 'writing' | 'speaking';

export type Choice = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  prompt: string;
  choices?: Choice[]; // si no hay choices, es abierta
  answer?: string; // correcta (para autocorrección)
  section: ExamSectionType;
};

export type ExamMock = {
  id: string;
  title: string;
  level: CEFRLevel;
  questions: Question[];
  createdAt: number;
};


