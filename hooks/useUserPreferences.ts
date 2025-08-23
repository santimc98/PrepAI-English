import { useEffect, useState } from 'react';
import { userPreferencesStore, type CertificationLevel } from '@/store/userPreferences';

export function useCertificationLevel() {
  const [level, setLevel] = useState<CertificationLevel>(userPreferencesStore.certificationLevel);
  const [hydrateDone, setHydrateDone] = useState(userPreferencesStore.hydrateDone);

  useEffect(() => {
    const updateState = () => {
      setLevel(userPreferencesStore.certificationLevel);
      setHydrateDone(userPreferencesStore.hydrateDone);
    };

    // Set initial state
    updateState();

    // Subscribe to changes
    const unsubscribe = userPreferencesStore.subscribe(updateState);

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return { 
    level, 
    hydrateDone,
    isReady: hydrateDone,
    isLoading: !hydrateDone
  };
}

export function useSetCertificationLevel() {
  return userPreferencesStore.setCertificationLevel.bind(userPreferencesStore);
}

export function useUserPreferences() {
  const { level, hydrateDone } = useCertificationLevel();
  const setLevel = useSetCertificationLevel();
  
  return {
    certificationLevel: level,
    setCertificationLevel: setLevel,
    isReady: hydrateDone,
    isLoading: !hydrateDone
  };
}
