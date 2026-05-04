import { useQuery } from '@tanstack/react-query';
import { samplesService } from '@/features/samples/api/service';
import type { SampleParams } from '@/features/samples/api/types';

export const samplesQueryKey = (params: SampleParams) =>
  ['samples', params.symbol, params.signal, params.from, params.to] as const;

export function useGetSamples(params: SampleParams) {
  return useQuery({
    queryKey: samplesQueryKey(params),
    queryFn: () => samplesService.list(params),
    staleTime: 60_000,
    enabled: Boolean(params.symbol && params.from && params.to),
  });
}
