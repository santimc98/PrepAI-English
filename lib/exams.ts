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

export async function generateExamViaEdge(params: { level: string; sections: string[] }) {
  const base = process.env.EXPO_PUBLIC_SUPABASE_URL!;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
  
  if (!base || !key) {
    throw new Error('EXPO_PUBLIC_SUPABASE_URL/ANON_KEY no configuradas');
  }
  
  const resp = await fetch(`${base}/functions/v1/generate-exam`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(params),
  });
  
  if (!resp.ok) {
    throw new Error(`Edge generation failed: ${resp.status} ${resp.statusText}`);
  }
  
  return await resp.json();
}

// TODO: Integrar esta función en el flujo principal cuando se despliegue la Edge Function
// Por ahora, solo está disponible para pruebas manuales


