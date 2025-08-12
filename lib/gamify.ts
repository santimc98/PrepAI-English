import type { Attempt } from '@/lib/storage';

export function computePointsFromAttempts(attempts: Attempt[]): number {
  if (!Array.isArray(attempts) || attempts.length === 0) return 0;
  return attempts.reduce((sum, a) => {
    const base = 10; // por simulacro
    const score = typeof a.score === 'number' ? a.score : 0;
    const bonus = Math.floor(score / 10); // 1 punto cada 10% de score
    return sum + base + bonus;
  }, 0);
}

export function levelFromPoints(n: number): 'A1'|'A2'|'B1'|'B2'|'C1'|'C2' {
  if (n <= 20) return 'A1';
  if (n <= 50) return 'A2';
  if (n <= 120) return 'B1';
  if (n <= 200) return 'B2';
  if (n <= 300) return 'C1';
  return 'C2';
}
