export function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function resolveCssVar(value: string): string {
  const m = value.match(/^var\((--[^)]+)\)$/);
  return m ? getCssVar(m[1]) : value;
}

/** Resolves any CSS color (including oklch) to a valid rgba() string for ECharts. */
export function toRgba(color: string, alpha: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return color;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgba(${r},${g},${b},${alpha})`;
}
