import type { ExamMock, Question } from '@/types/exam';

export function createSimpleMock(level: ExamMock['level']): ExamMock {
  const uid = () => Math.random().toString(36).slice(2, 10);
  const now = Date.now();
  const questions: Question[] = [
    {
      id: uid(),
      section: 'reading',
      prompt: 'Select the correct option: She has lived in London _____ 2015.',
      choices: [
        { id: uid(), text: 'for' },
        { id: uid(), text: 'since' },
        { id: uid(), text: 'from' },
      ],
      answer: 'since',
    },
    {
      id: uid(),
      section: 'use_of_english',
      prompt: 'Rewrite: They started working here 3 years ago. (been) They ______ 3 years.',
      answer: 'have been working here for',
    },
  ];

  return {
    id: uid(),
    title: `Mock ${level}`,
    level,
    questions,
    createdAt: now,
  };
}


