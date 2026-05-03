import type { Signal } from '@/features/signals/api/types';

export interface ISignalsService {
  list(): Signal[];
}
