import type { ExamMock } from '@/types/exam';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FORCE_CLOUD_KEY = 'dev:forceCloudGen';
async function shouldUseCloud(): Promise<boolean> {
  try {
    const forced = await AsyncStorage.getItem(FORCE_CLOUD_KEY);
    if (forced === 'true') return true;
  } catch {}
  return process.env.EXPO_PUBLIC_USE_SUPABASE === 'true';
}

export function createSimpleMock(level: ExamMock['level']): ExamMock {
  const uid = () => Math.random().toString(36).slice(2, 10);
  const now = Date.now();
  return {
    id: uid(),
    title: `Mock ${level}`,
    level,
    createdAt: now,
    questions: [
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
    ],
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
  const useCloud = await shouldUseCloud();
  if (useCloud) {
    try {
      const res = await generateExamViaEdge(params);
      return {
        id: Math.random().toString(36).slice(2, 10),
        title: res.title ?? `Mock ${params.level}`,
        level: res.level ?? (params.level as any),
        createdAt: Date.now(),
        questions: (res.sections || []).flatMap((s: any) =>
          (s.items || []).map((it: any) => ({
            id: it.id,
            section: s.name?.toLowerCase?.() || 'reading',
            prompt: it.prompt,
            choices: Array.isArray(it.options)
              ? it.options.map((opt: string) => ({ id: `${it.id}-${opt}`, text: opt }))
              : undefined,
            answer: it.answer,
          }))
        ),
      };
    } catch (e) {
      console.warn('[exams] Edge generation failed, using local mock:', e);
      return createSimpleMock(params.level as any);
    }
  }
  return createSimpleMock(params.level as any);
}


