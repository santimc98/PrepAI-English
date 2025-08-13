import { supabase } from '@/lib/supabase';
import type { ExamLevel } from '@/types/level';

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

export async function getAttemptWithAnswers(attemptId: string) {
  const { data: attempt, error: err1 } = await supabase
    .from('attempts')
    .select('*')
    .eq('id', attemptId)
    .single();
  if (err1) throw err1;
  const { data: answers, error: err2 } = await supabase
    .from('attempt_answers')
    .select('*')
    .eq('attempt_id', attemptId)
    .order('created_at', { ascending: true });
  if (err2) throw err2;
  return { attempt, answers };
}

export async function updateDefaultLevel(level: ExamLevel) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return;
    const { error } = await supabase.from('profiles').upsert({ id: uid, default_level: level });
    if (error) throw error;
  } catch (e) {
    console.warn('[db] updateDefaultLevel failed:', e);
  }
}

export async function getProfileDefaultLevel(): Promise<ExamLevel | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('default_level')
      .eq('id', uid)
      .single();
    if (error) throw error;
    const v = (data as any)?.default_level;
    return v === 'B1' || v === 'B2' || v === 'C1' || v === 'C2' ? (v as ExamLevel) : null;
  } catch (e) {
    console.warn('[db] getProfileDefaultLevel failed:', e);
    return null;
  }
}


