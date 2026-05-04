export const SignalKind = {
  Close: 'close',
  Volume: 'volume',
} as const;
export type SignalKind = (typeof SignalKind)[keyof typeof SignalKind];

export interface Signal {
  id: SignalKind;
  label: string;
}
