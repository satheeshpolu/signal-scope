import { useState } from 'react';
import { useLabelsStore } from '@/features/labels/store/labelsStore';
import { LabelCategory, CATEGORY_COLOR, type Label } from '@/features/labels/types';
import { LabelPopover } from '@/features/labels/components/LabelPopover';
import { Button } from '@/components/ui/Button';
import { formatMs } from '@/features/samples/utils';

export interface LabelSidebarProps {
  symbol: string;
}

export function LabelSidebar({ symbol }: LabelSidebarProps) {
  const { labels, remove, update, undo, redo } = useLabelsStore();
  const [editing, setEditing] = useState<Label | null>(null);

  const symbolLabels = labels.filter((l) => l.symbol === symbol);

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
            onClick={undo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            className="text-text-primary cursor-pointer"
          >
            ↩
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={redo}
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
            className="text-text-primary cursor-pointer"
          >
            ↪
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
              className="rounded-md border border-border-subtle bg-surface-800 p-3"
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

              <div className="mt-2 flex gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(label)}
                  aria-label={`Edit label ${label.note || label.category}`}
                  className="cursor-pointer"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => remove(label.id)}
                  aria-label={`Delete label ${label.note || label.category}`}
                  className="cursor-pointer"
                >
                  Delete
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
