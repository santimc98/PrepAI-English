import { QueryClient } from '@tanstack/react-query';
import { eventBus } from '@/store/eventBus';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

// Invalidate queries when certification level changes
eventBus.on('prefs:certLevel:changed', () => {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const queryKey = query.queryKey;
      // Invalidate any query that depends on the certification level
      return (
        (Array.isArray(queryKey) && 
         queryKey.some(k => 
           (typeof k === 'string' && k.includes('level')) ||
           (typeof k === 'object' && k !== null && 'level' in k)
         )) ||
        (query.meta as any)?.dependsOnLevel === true
      );
    },
  });
});

// Helper function to create query keys that depend on the certification level
export function createLevelDependentQueryKey(
  baseKey: string | string[], 
  level: string
) {
  const base = Array.isArray(baseKey) ? baseKey : [baseKey];
  return [...base, { level }];
}
