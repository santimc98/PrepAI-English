import { supabase } from '@/lib/supabase';

export async function upsertProfile(u: { id: string; email?: string | null; display_name?: string | null }) {
  try {
    const { error } = await supabase.from('profiles').upsert({
      id: u.id,
      email: u.email ?? undefined,
      display_name: u.display_name ?? undefined,
    });
    if (error) throw error;
  } catch (e) {
    console.warn('[db] upsertProfile failed:', e);
  }
}

export async function createAttempt(params: {
  userId: string;
  examId?: string | null;
  examSnapshot: any;
}) {
  const { data, error } = await supabase
    .from('attempts')
    .insert({
      user_id: params.userId,
      exam_id: params.examId ?? null,
      exam_snapshot: params.examSnapshot,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function saveAnswer(row: {
  attemptId: string;
  questionId: string;
  answer: any;
  correct?: boolean | null;
  points?: number | null;
}) {
  const { error } = await supabase.from('attempt_answers').insert({
    attempt_id: row.attemptId,
    question_id: row.questionId,
    answer: row.answer,
    correct: row.correct ?? null,
    points: row.points ?? null,
  });
  if (error) throw error;
}

export async function finishAttempt(attemptId: string, score?: number | null) {
  const { error } = await supabase
    .from('attempts')
    .update({ finished_at: new Date().toISOString(), score: score ?? null })
    .eq('id', attemptId);
  if (error) throw error;
}

export async function listMyAttempts() {
  const { data, error } = await supabase
    .from('attempts')
    .select('*')
    .order('started_at', { ascending: false });
  if (error) throw error;
  return data;
}


