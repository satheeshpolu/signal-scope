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
        moveOnMouseMove: true,
      },
      {
        type: 'slider',
        xAxisIndex: 0,
        height: 28,
        bottom: 12,
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

export function TimeseriesChart({ samples, labels, signal, symbol, onZoom }: TimeseriesChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsType | null>(null);
  const dragRef = useRef<DragState>({
    active: false,
    startX: 0,
    startTime: 0,
    endTime: 0,
  });
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
  // Keep a ref so the F5 handler always sees the latest popover state
  const popoverRef = useRef(popover);
  useEffect(() => {
    popoverRef.current = popover;
  }, [popover]);

  // Init chart once
  useEffect(() => {
    if (!containerRef.current) return;
    const chart = echarts.init(containerRef.current, null, {
      renderer: 'canvas',
    });
    chartRef.current = chart;

    // Zoom callback — notify parent to update URL
    chart.on('dataZoom', () => {
      const option = chart.getOption() as {
        dataZoom?: Array<{ startValue?: number; endValue?: number }>;
      };
      const dz = option.dataZoom?.[0];
      if (dz?.startValue != null && dz?.endValue != null && onZoom) {
        onZoom(dz.startValue, dz.endValue);
      }
    });

    // ZRender mouse events for label drag
    const zr = chart.getZr();

    zr.on('mousedown', (e: unknown) => {
      const ev = e as ZrEvent;
      if (ev.which !== undefined && ev.which !== 1) return;
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
      if (!dragRef.current.active) return;
      const ev = e as ZrEvent;
      const dataCoord = chart.convertFromPixel({ gridIndex: 0 }, [ev.offsetX, ev.offsetY]);
      if (!Array.isArray(dataCoord) || dataCoord.length < 2) return;
      dragRef.current.endTime = dataCoord[0] as number;
      const x = Math.min(dragRef.current.startX, ev.offsetX);
      const width = Math.abs(ev.offsetX - dragRef.current.startX);
      const from = Math.min(dragRef.current.startTime, dragRef.current.endTime);
      const to = Math.max(dragRef.current.startTime, dragRef.current.endTime);
      setDragSelection({ x, width, from, to });
      setPopover({
        visible: false,
        x: 0,
        y: 0,
        from,
        to,
      });
    });

    zr.on('mouseup', (e: unknown) => {
      if (!dragRef.current.active) return;
      const ev = e as ZrEvent;
      dragRef.current.active = false;
      if (containerRef.current) containerRef.current.querySelector('canvas')!.style.cursor = '';
      // setDragSelection(null);

      const dx = Math.abs(ev.offsetX - dragRef.current.startX);
      if (dx < 8) return; // too small — ignore, treat as click

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

  // Update option when data changes
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.setOption(buildOption(samples, labels, signal), {
      notMerge: false,
      lazyUpdate: true,
    });
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

  const popoverFormRef = useRef<HTMLFormElement>(null);

  // F5 → submit the popover form (reads current note + category values)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'F5') return;
      e.preventDefault();
      if (!popoverRef.current.visible) return;
      popoverFormRef.current?.requestSubmit();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Hide ECharts tooltip + crosshair while the label popover is open
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.setOption({ tooltip: { show: !popover.visible } });
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
          formRef={popoverFormRef}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
