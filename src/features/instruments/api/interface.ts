import type { Instrument } from '@/features/instruments/api/types';

export interface IInstrumentsService {
  list(): Promise<Instrument[]>;
}
