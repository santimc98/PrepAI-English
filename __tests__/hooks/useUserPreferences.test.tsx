import React, { PropsWithChildren } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Importa tus hooks reales del proyecto
import { useUserPreferences, useSetCertificationLevel } from '../../hooks/useUserPreferences';
// Si tu app necesita un provider propio para prefs, descomenta la siguiente línea y úsalo en el wrapper
// import { PrefsProvider } from '../../providers/PrefsProvider';

function Providers({ children }: PropsWithChildren) {
  const qc = new QueryClient();
  return (
    <QueryClientProvider client={qc}>
      {/* <PrefsProvider> */}
        {children}
      {/* </PrefsProvider> */}
    </QueryClientProvider>
  );
}

describe('useUserPreferences', () => {
  it('expone el nivel actual de certificación', () => {
    const { result } = renderHook(() => useUserPreferences(), { wrapper: Providers });
    // No asumimos el valor por defecto: solo comprobamos que exista y sea string
    expect(typeof result.current.certificationLevel).toBe('string');
  });

  it('permite actualizar el nivel con el setter del hook', async () => {
    const { result } = renderHook(
      () => ({
        level: useUserPreferences().certificationLevel,
        setLevel: useSetCertificationLevel(),
      }),
      { wrapper: Providers }
    );

    const initial = result.current.level;
    const next = initial === 'C1' ? 'B2' : 'C1';

    await act(async () => {
      // Soporta tanto setters síncronos como async
      const maybePromise = result.current.setLevel(next as any);
      if (maybePromise && typeof (maybePromise as Promise<void>).then === 'function') {
        await (maybePromise as Promise<void>);
      }
    });

    await waitFor(() => {
      expect(result.current.level).toBe(next);
    });
  });
});
