// lib/exams.ts
import { supabase } from '@/lib/supabase';
import type { ExamLevel } from '@/types/level';
import type { Exam, ExamSection } from '@/types/exam';

// Helper local: evita problemas de import de ./utils
function withTimeout<T>(
  promise: Promise<T>,
  ms = 10_000,
  message = `Timeout after ${ms}ms`
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(message)), ms);
    promise
      .then((v) => { clearTimeout(t); resolve(v); })
      .catch((e) => { clearTimeout(t); reject(e); });
  });
}

type GetExamOpts = {
  sections: ExamSection[];
  level?: ExamLevel;
};

export async function getExam(opts: GetExamOpts): Promise<Exam> {
  const level: ExamLevel = opts.level ?? 'B2';

  const useCloud =
    process.env.EXPO_PUBLIC_USE_SUPABASE === 'true' &&
    !!supabase;

  if (useCloud) {
    try {
      const exam = await withTimeout(
        generateExamViaEdge({ level, sections: opts.sections }),
        10_000
      );
      if (exam) return exam;
    } catch (e) {
      console.warn('[exams] Edge failed, falling back to mock:', e);
    }
  }
  return generateMockExam(level, opts.sections);
}

// -------- Edge Function ----------
async function generateExamViaEdge(params: {
  level: ExamLevel;
  sections: ExamSection[];
}): Promise<Exam> {
  const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/generate-exam`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      level: params.level,
      sections: params.sections,
    }),
  });
  if (!res.ok) throw new Error(`Edge ${res.status}`);
  const json = await res.json();
  return { ...json, level: params.level } as Exam;
}

// -------- Mock local ----------
export function generateMockExam(
  level: ExamLevel,
  sections: ExamSection[]
): Exam {
  const now = Date.now();
  return {
    id: `mock-${now}`,
    title: `Simulacro ${level}`,
    level,
    sections: sections.length
      ? sections
      : (['Reading', 'Use of English', 'Listening'] as ExamSection[]),
    items: [
      {
        id: `q1-${now}`,
        type: 'mcq',
        prompt: `[${level}] Choose the correct option to complete the sentence.`,
        options: ['A', 'B', 'C', 'D'],
        answer: 1,
        section: 'Reading',
        points: 1,
      },
      {
        id: `q2-${now}`,
        type: 'gap',
        prompt: `[${level}] Fill the gap with the correct form.`,
        answer: 'example',
        section: 'Use of English',
        points: 1,
      },
    ],
  } as unknown as Exam;
}
