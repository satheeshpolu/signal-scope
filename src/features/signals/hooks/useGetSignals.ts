import { useQuery } from '@tanstack/react-query';
import { signalsService } from '@/features/signals/api/service';

export const SIGNALS_QUERY_KEY = ['signals'] as const;

export function useGetSignals() {
  return useQuery({
    queryKey: SIGNALS_QUERY_KEY,
    queryFn: () => signalsService.list(),
    staleTime: Infinity,
  });
}
