import type { Sample } from '@/features/samples/api/types';

/**
 * Largest-Triangle-Three-Buckets downsampler.
 * Reduces `data` to at most `threshold` points while preserving visual shape.
 * Always keeps the first and last points.
 */
export function lttb(
  data: Sample[],
  threshold: number,
  valueKey: keyof Pick<Sample, 'close' | 'volume'>,
): Sample[] {
  const n = data.length;
  if (n <= threshold) return data;

  // Normalize timestamps to [0, 1] so they're on the same scale as normalised
  // values — prevents the large ms magnitude from dominating the triangle area.
  const minT = data[0].t;
  const spanT = data[n - 1].t - minT || 1;
  const allValues = data.map((d) => d[valueKey]);
  const minV = Math.min(...allValues);
  const spanV = Math.max(...allValues) - minV || 1;

  const tx = (t: number) => (t - minT) / spanT;
  const vx = (v: number) => (v - minV) / spanV;

  const sampled: Sample[] = [data[0]];
  const bucketSize = (n - 2) / (threshold - 2);
  let prevSelected = 0;

  for (let i = 0; i < threshold - 2; i++) {
    const currStart = Math.floor(i * bucketSize) + 1;
    const currEnd = Math.min(Math.floor((i + 1) * bucketSize) + 1, n - 1);
    const nextStart = currEnd;
    const nextEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, n - 1);

    // Average of the next bucket (lookahead). Fall back to the last point when
    // the next bucket is empty (last iteration) — matches the original paper.
    let avgT: number;
    let avgV: number;
    const nextLen = nextEnd - nextStart;
    if (nextLen > 0) {
      avgT = 0;
      avgV = 0;
      for (let j = nextStart; j < nextEnd; j++) {
        avgT += tx(data[j].t);
        avgV += vx(data[j][valueKey]);
      }
      avgT /= nextLen;
      avgV /= nextLen;
    } else {
      avgT = tx(data[n - 1].t);
      avgV = vx(data[n - 1][valueKey]);
    }

    const a = data[prevSelected];
    const aT = tx(a.t);
    const aV = vx(a[valueKey]);
    let maxArea = -1;
    let maxIdx = currStart;

    for (let j = currStart; j < currEnd; j++) {
      // Triangle area (the ×0.5 factor is omitted — constant, doesn't affect argmax)
      const area = Math.abs(
        (aT - avgT) * (vx(data[j][valueKey]) - aV) - (aT - tx(data[j].t)) * (avgV - aV),
      );
      if (area > maxArea) {
        maxArea = area;
        maxIdx = j;
      }
    }

    sampled.push(data[maxIdx]);
    prevSelected = maxIdx;
  }

  sampled.push(data[n - 1]);
  return sampled;
}

export function formatMs(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

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
