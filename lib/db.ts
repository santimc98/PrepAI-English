import { supabase } from '@/lib/supabase';

export async function createAttempt(params: { userId: string; examSnapshot: any; examId?: string }) {
  // Placeholder; implementar cuando existan tablas en Supabase
  return params;
}

export async function finishAttempt(id: string, score?: number) {
  // Placeholder; implementar cuando existan tablas en Supabase
  return { id, score };
}


