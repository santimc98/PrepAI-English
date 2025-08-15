// lib/utils.ts

/**
 * Envuelve una promesa con timeout. Si no resuelve antes de `ms`,
 * rechaza con Error(message).
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms = 10_000,
  message = `Timeout after ${ms}ms`
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/** Pequeño helper opcional por si lo necesitas en otros sitios */
export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
