import type { ISignalsService } from '@/features/signals/api/interface';
import { SignalKind, type Signal } from '@/features/signals/api/types';

const SIGNALS: readonly Signal[] = [
  { id: SignalKind.Close, label: 'Close Price' },
  { id: SignalKind.Volume, label: 'Volume' },
];

class SignalsService implements ISignalsService {
  private static _instance: SignalsService;

  static getInstance(): SignalsService {
    if (!SignalsService._instance) {
      SignalsService._instance = new SignalsService();
    }
    return SignalsService._instance;
  }

  list(): Signal[] {
    return [...SIGNALS];
  }
}

export const signalsService = SignalsService.getInstance();
