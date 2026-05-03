import type { Sample } from '@/features/samples/api/types';
import type { Label } from '@/features/labels/types';
import type { SignalKind as SignalKindType } from '@/features/signals/api/types';
import type { Theme } from '@/lib/theme/ThemeContext';

export interface DragState {
  active: boolean;
  startX: number; // pixel
  startTime: number; // data ms
  endTime: number; // data ms
}

export interface PopoverState {
  visible: boolean;
  x: number; // px within container
  y: number;
  from: number;
  to: number;
}

export interface TimeseriesChartProps {
  samples: Sample[];
  labels: Label[];
  signal: SignalKindType;
  symbol: string;
  theme: Theme;
  onZoom?: (from: number, to: number) => void;
}
