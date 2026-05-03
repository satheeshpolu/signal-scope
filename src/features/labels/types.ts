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
  from: number; // ms timestamp
  to: number; // ms timestamp
  category: LabelCategory;
  note: string;
}

/** Colors map to CSS custom properties defined in tokens */
export const CATEGORY_COLOR: Record<LabelCategory, string> = {
  rally: 'var(--color-success-500)',
  selloff: 'var(--color-danger-500)',
  consolidation: 'var(--color-warning-500)',
  breakout: 'var(--color-info-500)',
};
