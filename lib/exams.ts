import type { ExamMock, Question } from '@/types/exam';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export async function getExam(params: { level: string; sections: string[] }): Promise<ExamMock> {
  const useCloudEnv = process.env.EXPO_PUBLIC_USE_SUPABASE === 'true';
  const useCloudToggle = (await AsyncStorage.getItem('ui:useCloud')) === 'true';
  const useCloud = useCloudEnv && useCloudToggle;
  if (useCloud) {
    try {
      const res: any = await generateExamViaEdge(params);
      // Adaptar respuesta mock de la edge a nuestro ExamMock
      const questions: Question[] = (res.sections || []).flatMap((s: any) =>
        (s.items || []).map((it: any) => ({
          id: String(it.id),
          section: String(s.name || 'reading').toLowerCase(),
          prompt: String(it.prompt || ''),
          choices: Array.isArray(it.options)
            ? it.options.map((opt: string) => ({ id: `${it.id}-${opt}`, text: String(opt) }))
            : undefined,
          answer: it.answer != null ? String(it.answer) : undefined,
        }))
      );
      return {
        id: Math.random().toString(36).slice(2, 10),
        title: res.title ?? `Mock ${params.level}`,
        level: (res.level as ExamMock['level']) ?? (params.level as any),
        createdAt: Date.now(),
        questions,
      };
    } catch (e) {
      // Fallback local si falla la edge
      return createSimpleMock(params.level as any);
    }
  }
  // Local por defecto
  return createSimpleMock(params.level as any);
}

// TODO: Integrar esta función en más pantallas cuando se despliegue la Edge Function


