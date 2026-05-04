import { useQuery } from '@tanstack/react-query';
import { instrumentsService } from '@/features/instruments/api/service';

export const INSTRUMENTS_QUERY_KEY = ['instruments'] as const;

export function useGetInstruments() {
  return useQuery({
    queryKey: INSTRUMENTS_QUERY_KEY,
    queryFn: () => instrumentsService.list(),
    staleTime: 30_000,
  });
}
