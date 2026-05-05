import { useEffect, useRef, useCallback, useState } from 'react';
import * as echarts from 'echarts/core';
import { LineChart, BarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  MarkAreaComponent,
  AxisPointerComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import type { ECharts as EChartsType } from 'echarts/core';
import type { Sample } from '@/features/samples/api/types';
import { type Label, CATEGORY_COLOR } from '@/features/labels/types';
import { type SignalKind as SignalKindType, SignalKind } from '@/features/signals/api/types';
import {
  type DragState,
  type MarkBound,
  type PopoverState,
  type TimeseriesChartProps,
  type ZrEvent,
} from '@/features/samples/types';
import { LabelPopover } from '@/features/labels/components/LabelPopover';
import { useLabelsStore } from '@/features/labels/store/labelsStore';
import { formatMs, getCssVar, resolveCssVar, toRgba } from '@/features/samples/utils';

echarts.use([
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  MarkAreaComponent,
  AxisPointerComponent,
  CanvasRenderer,
]);
function buildOption(samples: Sample[], labels: Label[], signal: SignalKindType): EChartsOption {
  const isVolume = signal === SignalKind.Volume;

  const seriesData = samples.map((s) => [s.t, isVolume ? s.volume : s.close]);
  // ECharts MarkArea2DDataItemOption requires an exact [start, end] tuple.
  // Using .map() + explicit return type forces TypeScript to see 2-tuples.
  const markAreaData: [MarkBound, MarkBound][] = labels.map((label) => {
    const bandColor = resolveCssVar(CATEGORY_COLOR[label.category]);
    return [
      {
        xAxis: label.from,
        itemStyle: { color: bandColor, opacity: 0.15 },
        label: {
          show: true,
          position: 'insideTopLeft' as const,
          formatter: label.note || label.category,
          color: bandColor,
          fontSize: 11,
        },
      },
      { xAxis: label.to },
    ];
  });

  const textPrimary = getCssVar('--color-text-primary');
  const textMuted = getCssVar('--color-text-muted');
  const borderDefault = getCssVar('--color-border-default');
  const primary500 = getCssVar('--color-primary-500');
  const primary400 = getCssVar('--color-primary-400');
  const chartAxisLabelBg = getCssVar('--color-surface-600');
  const chartAxisLabelText = getCssVar('--color-text-secondary');
  const chartTooltipBg = getCssVar('--color-surface-600');

  return {
    backgroundColor: 'transparent',
    grid: { left: 60, right: 16, top: 16, bottom: 80 },
    xAxis: {
      type: 'time',
      axisLine: { lineStyle: { color: borderDefault } },
      axisLabel: { color: textMuted, fontSize: 11 },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: {
        color: textMuted,
        fontSize: 11,
        formatter: isVolume
          ? (v: number) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : `${(v / 1e3).toFixed(0)}K`)
          : (v: number) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v.toFixed(2)}`),
      },
      splitLine: { lineStyle: { color: borderDefault, opacity: 0.4 } },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: chartAxisLabelBg,
          color: textPrimary,
        },
      },
      backgroundColor: chartTooltipBg,
      borderColor: borderDefault,
      textStyle: { color: textPrimary, fontSize: 12 },
    },
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: 0,
        filterMode: 'filter',
        zoomOnMouseWheel: true,
        moveOnMouseMove: false,
      },
      {
        type: 'slider',
        xAxisIndex: 0,
        height: 28,
        bottom: 12,
        showDetail: false,
        fillerColor: toRgba(primary500, 0.13),
        borderColor: borderDefault,
        handleStyle: { color: primary500 },
        // textStyle: { color: textMuted, fontSize: 10 },
        // labelFormatter text uses the dedicated axis-label token so it
        // stays legible on both light and dark backgrounds.
        dataBackground: {
          lineStyle: { color: primary500 },
          areaStyle: { color: toRgba(primary500, 0.09) },
        },
        textStyle: { color: chartAxisLabelText, fontSize: 10 },
      },
    ],
    series: isVolume
      ? [
          {
            type: isVolume ? 'bar' : 'line',
            data: seriesData,
            barMaxWidth: 40,
            itemStyle: { color: primary500 },
            emphasis: {
              itemStyle: { color: primary400 },
            },
            markArea: markAreaData.length > 0 ? { silent: true, data: markAreaData } : undefined,
          },
        ]
      : [
          {
            type: 'line',
            data: seriesData,
            showSymbol: false,
            lineStyle: { color: primary500, width: 1.5 },
            itemStyle: { color: primary500 },
            emphasis: {
              itemStyle: { color: primary400 },
              lineStyle: { color: primary400, width: 4 },
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: toRgba(primary500, 0.25) },
                  { offset: 1, color: toRgba(primary500, 0) },
                ],
              },
            },
            markArea: markAreaData.length > 0 ? { silent: true, data: markAreaData } : undefined,
          },
        ],
  };
}

export function TimeseriesChart({
  samples,
  labels,
  signal,
  symbol,
  viewFrom,
  viewTo,
  onZoom,
}: TimeseriesChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsType | null>(null);
  const dragRef = useRef<DragState>({
    active: false,
    startX: 0,
    startTime: 0,
    endTime: 0,
  });
  const dzPercentRef = useRef({ start: 0, end: 100 });
  const samplesRef = useRef(samples);
  useEffect(() => {
    samplesRef.current = samples;
  }, [samples]);
  const onZoomRef = useRef(onZoom);
  useEffect(() => {
    onZoomRef.current = onZoom;
  }, [onZoom]);
  const viewFromRef = useRef(viewFrom);
  useEffect(() => {
    viewFromRef.current = viewFrom;
  }, [viewFrom]);
  const viewToRef = useRef(viewTo);
  useEffect(() => {
    viewToRef.current = viewTo;
  }, [viewTo]);
  const prevSamplesRef = useRef<typeof samples | null>(null);
  const [popover, setPopover] = useState<PopoverState>({
    visible: false,
    x: 0,
    y: 0,
    from: 0,
    to: 0,
  });
  const [dragSelection, setDragSelection] = useState<{
    x: number;
    width: number;
    from: number;
    to: number;
  } | null>(null);
  const { add } = useLabelsStore();

  // Init chart once
  useEffect(() => {
    if (!containerRef.current) return;
    const chart = echarts.init(containerRef.current, null, {
      renderer: 'canvas',
    });
    chartRef.current = chart;

    // Zoom callback — notify parent to update URL, dismiss any open label UI
    chart.on('dataZoom', (params: unknown) => {
      const ev = params as {
        batch?: Array<{ start?: number; end?: number; startValue?: number; endValue?: number }>;
        start?: number;
        end?: number;
        startValue?: number;
        endValue?: number;
      };
      const entry = ev.batch?.[0] ?? ev;
      if (entry.start != null && entry.end != null) {
        dzPercentRef.current = { start: entry.start, end: entry.end };
      }
      let startVal = entry.startValue;
      let endVal = entry.endValue;
      if ((startVal == null || endVal == null) && entry.start != null && entry.end != null) {
        const s = samplesRef.current;
        if (s.length > 0) {
          const minT = s[0].t;
          const maxT = s[s.length - 1].t;
          startVal = minT + (entry.start / 100) * (maxT - minT);
          endVal = minT + (entry.end / 100) * (maxT - minT);
        }
      }
      if (startVal != null && endVal != null && onZoomRef.current) {
        onZoomRef.current(startVal, endVal);
      }
      setPopover((p) => ({ ...p, visible: false }));
      setDragSelection(null);
    });

    // ZRender mouse events for label drag
    const zr = chart.getZr();

    const inGrid = (x: number, y: number) => chart.containPixel('grid', [x, y]);

    zr.on('mousedown', (e: unknown) => {
      const ev = e as ZrEvent;
      if (ev.which !== undefined && ev.which !== 1) return;
      if (!inGrid(ev.offsetX, ev.offsetY)) return;
      const dataCoord = chart.convertFromPixel({ gridIndex: 0 }, [ev.offsetX, ev.offsetY]);
      if (!Array.isArray(dataCoord) || dataCoord.length < 2) return;
      dragRef.current = {
        active: true,
        startX: ev.offsetX,
        startTime: dataCoord[0] as number,
        endTime: dataCoord[0] as number,
      };
      if (containerRef.current)
        containerRef.current.querySelector('canvas')!.style.cursor = 'crosshair';
    });

    zr.on('mousemove', (e: unknown) => {
      const ev = e as ZrEvent;
      if (!inGrid(ev.offsetX, ev.offsetY)) {
        // Determine cursor based on whether mouse is over the filled selection or empty track
        const canvas = containerRef.current?.querySelector('canvas');
        if (canvas) {
          const { start, end } = dzPercentRef.current;
          const w = containerRef.current!.clientWidth;
          const startPx = 60 + (start / 100) * (w - 60 - 16);
          const endPx = 60 + (end / 100) * (w - 60 - 16);
          const hasZoom = end - start < 99;
          canvas.style.cursor =
            hasZoom && ev.offsetX >= startPx && ev.offsetX <= endPx ? 'pointer' : 'crosshair';
        }
        if (!dragRef.current.active) return;
      }
      if (!dragRef.current.active) return;
      const dataCoord = chart.convertFromPixel({ gridIndex: 0 }, [ev.offsetX, ev.offsetY]);
      if (!Array.isArray(dataCoord) || dataCoord.length < 2) return;
      dragRef.current.endTime = dataCoord[0] as number;
      const x = Math.min(dragRef.current.startX, ev.offsetX);
      const width = Math.abs(ev.offsetX - dragRef.current.startX);
      const from = Math.min(dragRef.current.startTime, dragRef.current.endTime);
      const to = Math.max(dragRef.current.startTime, dragRef.current.endTime);
      setDragSelection({ x, width, from, to });
      setPopover({ visible: false, x: 0, y: 0, from, to });
    });

    zr.on('mouseup', (e: unknown) => {
      if (!dragRef.current.active) return;
      const ev = e as ZrEvent;
      dragRef.current.active = false;
      if (containerRef.current) containerRef.current.querySelector('canvas')!.style.cursor = '';

      const dx = Math.abs(ev.offsetX - dragRef.current.startX);
      if (dx < 8) return;

      const from = Math.min(dragRef.current.startTime, dragRef.current.endTime);
      const to = Math.max(dragRef.current.startTime, dragRef.current.endTime);

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setPopover({
        visible: true,
        x: ev.offsetX - rect.left + 8,
        y: ev.offsetY - rect.top + 8,
        from,
        to,
      });
    });

    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update option when data changes; restore zoom when a new sample set arrives
  useEffect(() => {
    if (!chartRef.current) return;
    const samplesChanged = samples !== prevSamplesRef.current;
    prevSamplesRef.current = samples;

    chartRef.current.setOption(buildOption(samples, labels, signal), {
      notMerge: false,
      lazyUpdate: true,
    });

    if (samplesChanged && samples.length > 0) {
      const minT = samples[0].t;
      const maxT = samples[samples.length - 1].t;
      const totalSpan = maxT - minT;
      let start = 0;
      let end = 100;
      const vFrom = viewFromRef.current;
      const vTo = viewToRef.current;
      if (totalSpan > 0 && vFrom != null && vTo != null) {
        const s = Math.max(0, ((vFrom - minT) / totalSpan) * 100);
        const e = Math.min(100, ((vTo - minT) / totalSpan) * 100);
        // Only restore zoom if actually zoomed in (not showing the full range)
        if (e - s < 99) {
          start = s;
          end = e;
        }
      }
      chartRef.current.setOption(
        {
          dataZoom: [
            { start, end },
            { start, end },
          ],
        },
        { notMerge: false, lazyUpdate: true },
      );
      dzPercentRef.current = { start, end };
    }
  }, [samples, labels, signal]);

  const handleSave = useCallback(
    (data: Omit<Label, 'id'>) => {
      add(data);
      setPopover((p) => ({ ...p, visible: false }));
      setDragSelection(null);
    },
    [add],
  );

  const handleClose = useCallback(() => {
    setPopover((p) => ({ ...p, visible: false }));
    setDragSelection(null);
  }, []);

  // Hide ECharts tooltip + crosshair while the label popover is open
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.setOption({ tooltip: { show: !popover.visible } });
    chartRef.current.dispatchAction({ type: 'hideTip' });
  }, [popover.visible]);

  return (
    <div className="relative h-full w-full" ref={containerRef}>
      {dragSelection && (
        <div
          className="pointer-events-none absolute bg-primary-400/20 border-x border-primary-400/60"
          style={{ left: dragSelection.x, width: dragSelection.width, top: 0, bottom: 80 }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-surface-600/90 px-2 py-0.5 text-[12px] font-medium text-text-secondary shadow ring-1 ring-border-default/40">
            {formatMs(dragSelection.from)}&nbsp;–&nbsp;{formatMs(dragSelection.to)}
          </div>
        </div>
      )}
      {popover.visible && (
        <LabelPopover
          position={{ x: popover.x + 50, y: 200 }}
          initialFrom={popover.from}
          initialTo={popover.to}
          symbol={symbol}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
