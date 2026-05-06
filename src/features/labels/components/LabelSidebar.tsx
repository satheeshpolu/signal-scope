import { useState } from 'react';
import { useLabelsStore } from '@/features/labels/store/labelsStore';
import { LabelCategory, CATEGORY_COLOR, type Label } from '@/features/labels/types';
import { LabelPopover } from '@/features/labels/components/LabelPopover';
import { Button } from '@/components/ui/Button';
import { formatMs } from '@/features/samples/utils';
import { UndoIcon, RedoIcon, TrashIcon, PencilIcon } from '@/components/icons';

export interface LabelSidebarProps {
  symbol: string;
  onLabelFocus?: (label: Label) => void;
  onHistoryChange?: () => void;
}

export function LabelSidebar({ symbol, onLabelFocus, onHistoryChange }: LabelSidebarProps) {
  const { labels, remove, update, undo, redo } = useLabelsStore();
  const [editing, setEditing] = useState<Label | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const symbolLabels = labels.filter((l) => l.symbol === symbol);

  const handleFocus = (label: Label) => {
    setActiveId(label.id);
    onLabelFocus?.(label);
  };
  const handleUpdate = (data: Omit<Label, 'id'>) => {
    if (!editing) return;
    update(editing.id, data);
    setEditing(null);
  };

  return (
    <aside
      className="flex h-full w-64 flex-col border-l border-border-default bg-surface-900 p-4"
      aria-label="Labels"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Labels</h2>

        <div className="flex gap-1">
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              undo();
              onHistoryChange?.();
            }}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            className="text-text-primary cursor-pointer"
          >
            <UndoIcon />
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              redo();
              onHistoryChange?.();
            }}
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
            className="text-text-primary cursor-pointer"
          >
            <RedoIcon />
          </Button>
        </div>
      </div>

      <p className="mb-4 text-xs text-text-muted">Ctrl+Z / Ctrl+Shift+Z to undo/redo</p>

      {symbolLabels.length === 0 ? (
        <p className="text-xs text-text-muted">Drag a range on the chart to add a label.</p>
      ) : (
        <ul className="flex flex-col gap-2 overflow-y-auto">
          {symbolLabels.map((label) => (
            <li
              key={label.id}
              onClick={() => handleFocus(label)}
              className={`cursor-pointer rounded-md border bg-surface-800 p-3 pl-3.5 transition-colors ${
                activeId === label.id
                  ? 'border-border-interactive ring-1 ring-primary-400/40'
                  : 'border-border-subtle'
              }`}
              style={{ borderLeftColor: CATEGORY_COLOR[label.category], borderLeftWidth: '3px' }}
            >
              {/* Category chip */}
              <span
                className="mb-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium text-surface-950 capitalize"
                style={{ backgroundColor: CATEGORY_COLOR[label.category] }}
              >
                {label.category}
              </span>

              <p className="text-xs text-text-muted">
                {formatMs(label.from)} – {formatMs(label.to)}
              </p>
              {label.note && <p className="mt-1 text-xs text-text-primary">{label.note}</p>}

              <div className="mt-2 flex items-center justify-end gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    setEditing(label);
                  }}
                  aria-label={`Edit label ${label.note || label.category}`}
                  className="w-7 cursor-pointer px-0"
                >
                  <PencilIcon className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    remove(label.id);
                  }}
                  aria-label={`Delete label ${label.note || label.category}`}
                  className="w-7 cursor-pointer px-0 text-danger-500 hover:text-danger-500"
                >
                  <TrashIcon className="h-5 w-5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Edit popover (inline, absolute within the sidebar) */}
      {editing && (
        <div className="relative">
          <LabelPopover
            position={{ x: 0, y: 0 }}
            initialFrom={editing.from}
            initialTo={editing.to}
            symbol={symbol}
            editing={editing}
            onSave={handleUpdate}
            onClose={() => setEditing(null)}
          />
        </div>
      )}

      {/* Legend */}
      <div className="mt-auto pt-4">
        <p className="mb-2 text-md font-medium text-text-muted">Categories</p>
        <ul className="flex flex-col gap-1">
          {Object.values(LabelCategory).map((c) => (
            <li key={c} className="flex items-center gap-2">
              <span
                className="inline-block h-4 w-4 rounded-full"
                style={{ backgroundColor: CATEGORY_COLOR[c] }}
              />
              <span className="text-xs text-text-secondary capitalize">{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
