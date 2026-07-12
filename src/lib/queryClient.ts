import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query verwaltet alle Server-Daten (Laden, Caching, Neuladen).
 * Das erspart manuelles useState/useEffect-Gefrickel bei jedem API-Aufruf.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 Minute als "frisch" betrachten
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
