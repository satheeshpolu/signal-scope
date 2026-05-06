import { useRef, useEffect, type SubmitEvent } from 'react';
import { LabelCategory, type Label, type PopoverPosition } from '@/features/labels/types';
import type { SignalKind as SignalKindType } from '@/features/signals/api/types';
import { Button } from '@/components/ui/Button';

export interface LabelPopoverProps {
  position: PopoverPosition;
  initialFrom: number;
  initialTo: number;
  symbol: string;
  signal: SignalKindType;
  editing?: Label;
  onSave: (data: Omit<Label, 'id'>) => void;
  onClose: () => void;
}

export function LabelPopover({
  position,
  initialFrom,
  initialTo,
  symbol,
  signal,
  editing,
  onSave,
  onClose,
}: LabelPopoverProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const firstInputRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const category = fd.get('category') as LabelCategory;
    const note = (fd.get('note') as string).trim();
    onSave({ symbol, signal, from: initialFrom, to: initialTo, category, note });
  };

  return (
    <div
      role="dialog"
      aria-label="Add label"
      style={{ top: position.y, left: position.x }}
      className="absolute z-50 w-64 rounded-lg border border-border-default bg-surface-800 p-4 shadow-popover"
    >
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-secondary">Add Label</p>

        <div className="flex flex-col gap-1">
          <label htmlFor="label-category" className="text-xs text-text-muted">
            Category
          </label>
          <select
            id="label-category"
            name="category"
            ref={firstInputRef}
            defaultValue={editing?.category ?? LabelCategory.Rally}
            className="h-8 rounded-md border border-border-default bg-surface-700 px-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer"
            required
          >
            {Object.values(LabelCategory).map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="label-note" className="text-xs text-text-muted">
            Note
          </label>
          <input
            id="label-note"
            name="note"
            type="text"
            defaultValue={editing?.note ?? ''}
            placeholder="e.g. ETF approval"
            className="h-8 rounded-md border border-border-default bg-surface-700 px-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" className="text-text-primary">
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
