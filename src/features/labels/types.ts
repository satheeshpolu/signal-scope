import { SignalKind, type SignalKind as SignalKindType } from '@/features/signals/api/types';

export const LabelCategory = {
  Rally: 'rally',
  Selloff: 'selloff',
  Consolidation: 'consolidation',
  Breakout: 'breakout',
} as const;
export type LabelCategory = (typeof LabelCategory)[keyof typeof LabelCategory];

export interface Label {
  id: string;
  symbol: string;
  signal?: SignalKindType;
  from: number; // ms timestamp
  to: number; // ms timestamp
  category: LabelCategory;
  note: string;
}

export function isLabelVisibleForSignal(label: Label, signal: SignalKindType): boolean {
  // Legacy persisted labels have no signal; treat them as close-price labels.
  return (label.signal ?? SignalKind.Close) === signal;
}

/** Colors map to CSS custom properties defined in tokens */
export const CATEGORY_COLOR: Record<LabelCategory, string> = {
  rally: 'var(--color-success-500)',
  selloff: 'var(--color-selloff-500)',
  consolidation: 'var(--color-warning-500)',
  breakout: 'var(--color-info-500)',
};

export interface PopoverPosition {
  x: number;
  y: number;
}
