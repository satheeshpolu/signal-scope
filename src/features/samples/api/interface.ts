import type { Sample, SampleParams } from '@/features/samples/api/types';

export interface ISamplesService {
  list(params: SampleParams): Promise<Sample[]>;
}
