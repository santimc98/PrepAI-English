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

// Alias to align with spec naming used elsewhere
export const generateMockExam = createSimpleMock;

// Utility: timeout wrapper
export async function withTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  return await Promise.race<T>([
    fn(),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)) as Promise<T>,
  ]);
}

// Cloud toggle (dev) from AsyncStorage; default true
export async function getCloudToggle(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem('dev:cloudExam');
    if (v == null) return true; // default true
    return v === 'true';
  } catch {
    return true;
  }
}

export async function generateExamViaEdge(params: { level: string; sections: string[] }) {
  const base = process.env.EXPO_PUBLIC_SUPABASE_URL!;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
  
  if (!base || !key) {
    throw new Error('EXPO_PUBLIC_SUPABASE_URL/ANON_KEY no configuradas');
  }
  
  try {
    const resp = await fetch(`${base}/functions/v1/generate-exam`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(params),
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`Edge generation failed: ${resp.status} ${resp.statusText}${text ? ` - ${text}` : ''}`);
    }
    return await resp.json();
  } catch (e: any) {
    throw new Error(e?.message || 'Edge request failed');
  }
}

export async function getExam(params: { level: string; sections: string[] }): Promise<ExamMock> {
  const useCloud = (await getCloudToggle()) && process.env.EXPO_PUBLIC_USE_SUPABASE === 'true';
  if (useCloud) {
    try {
      const res: any = await withTimeout(() => generateExamViaEdge(params), 10_000);
      // Adaptar respuesta de la edge a nuestro ExamMock
      const questions: Question[] = (res.sections || []).flatMap((s: any) =>
        (s.items || []).map((it: any) => ({
          id: String(it.id ?? `${s.name}-${Math.random().toString(36).slice(2, 8)}`),
          section: String(s.name || 'reading').toLowerCase(),
          prompt: String(it.prompt || ''),
          choices: Array.isArray(it.options)
            ? it.options.map((opt: string) => ({ id: `${it.id ?? 'opt'}-${opt}`, text: String(opt) }))
            : undefined,
          answer: it.answer != null ? String(it.answer) : undefined,
          // optional explanation passthrough
          ...(it.explanation ? { explanation: String(it.explanation) } : {}),
        }))
      );
      return {
        id: Math.random().toString(36).slice(2, 10),
        title: res.title ?? `Mock ${params.level}`,
        level: (res.level as ExamMock['level']) ?? (params.level as any),
        createdAt: Date.now(),
        questions,
      };
    } catch {
      // fallthrough to local
    }
  }
  return generateMockExam(params.level as any);
}

// TODO: Integrar esta función en más pantallas cuando se despliegue la Edge Function


