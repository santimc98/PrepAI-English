import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { userPreferencesStore, type CertificationLevel } from '@/store';
import { useCertificationLevel, useSetCertificationLevel, useUserPreferences } from '@/hooks/useUserPreferences';

// Create a test component that uses the hooks
function TestComponent() {
  const { certificationLevel } = useUserPreferences();
  const setCertificationLevel = useSetCertificationLevel();
  
  return (
    <div>
      <span data-testid="level">{certificationLevel}</span>
      <button 
        onClick={() => setCertificationLevel('C1')}
        data-testid="set-level"
      >
        Set Level
      </button>
    </div>
  );
}

describe('useUserPreferences', () => {
  let wrapper: React.FC<{ children: React.ReactNode }>;
  
  beforeEach(() => {
    // Reset the store before each test
    userPreferencesStore.setCertificationLevel('B1', { persist: false, syncServer: false });
    
    // Wrap with QueryClientProvider
    wrapper = ({ children }) => (
      <QueryClientProvider client={new QueryClient()}>
        {children}
      </QueryClientProvider>
    );
  });
  
  it('should provide the current certification level', async () => {
    const { result } = renderHook(() => useUserPreferences(), { wrapper });
    
    // Check the default value
    expect(result.current.certificationLevel).toBe('B1');
    expect(result.current.isHydrated).toBe(true);
  });
  
  it('should update when the level changes', async () => {
    await store.initialize();
    
    const { result } = renderHook(
      () => ({
        level: useUserPreferences().certificationLevel,
        setLevel: useSetCertificationLevel(),
      }), 
      { wrapper }
    );
    
    // Initial level
    expect(result.current.level).toBe('B1');
    
    // Change the level
    await act(async () => {
      await result.current.setLevel('C1');
    });
    
    // Should reflect the new level
    expect(result.current.level).toBe('C1');
  });
  
  it('should handle async operations correctly', async () => {
    // Mock the store's initialization
    await store.initialize();
    
    const { result, waitForNextUpdate } = renderHook(
      () => ({
        level: useUserPreferences().certificationLevel,
        setLevel: useSetCertificationLevel(),
      }), 
      { wrapper }
    );
    
    // Initial level
    expect(result.current.level).toBe('B1');
    
    // Change the level with options
    let setPromise: Promise<void>;
    await act(async () => {
      setPromise = result.current.setLevel('C1', { persist: true, syncServer: true });
      // Should be in loading state
      expect(result.current.level).toBe('C1');
      
      // Wait for the operation to complete
      await setPromise;
    });
    
    // Should still be the new level after operation completes
    expect(result.current.level).toBe('C1');
  });
  
  it('should handle errors gracefully', async () => {
    // Mock the store's initialization with an error
    jest.spyOn(store, 'initialize').mockRejectedValueOnce(new Error('Initialization failed'));
    
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();
    
    const { result, waitForNextUpdate } = renderHook(
      () => useUserPreferences(), 
      { wrapper }
    );
    
    // Should handle the error and still provide default values
    expect(result.current.certificationLevel).toBe('B1');
    expect(result.current.isHydrated).toBe(true);
    
    // Restore console.error
    console.error = originalError;
  });
  
  it('should update all components when level changes', async () => {
    // Mock the store's initialization
    await store.initialize();
    
    const { result: result1 } = renderHook(() => useUserPreferences(), { wrapper });
    const { result: result2 } = renderHook(() => useUserPreferences(), { wrapper });
    
    // Both hooks should have the same initial level
    expect(result1.current.certificationLevel).toBe('B1');
    expect(result2.current.certificationLevel).toBe('B1');
    
    // Get setter from a third hook
    const { result: setter } = renderHook(() => useSetCertificationLevel(), { wrapper });
    
    // Change the level
    await act(async () => {
      await setter.current('C1');
    });
    
    // Both hooks should be updated
    expect(result1.current.certificationLevel).toBe('C1');
    expect(result2.current.certificationLevel).toBe('C1');
  });
});
