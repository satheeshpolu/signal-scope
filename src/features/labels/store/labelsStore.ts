import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Label } from '@/features/labels/types';

const MAX_HISTORY = 50;

interface LabelsState {
  labels: Label[];
  _past: Label[][];
  _future: Label[][];

  add(label: Omit<Label, 'id'>): void;
  update(id: string, patch: Partial<Omit<Label, 'id'>>): void;
  remove(id: string): void;
  undo(): void;
  redo(): void;
}

function snapshot(labels: Label[]): Label[] {
  return [...labels];
}

export const useLabelsStore = create<LabelsState>()(
  persist(
    (set, get) => ({
      labels: [],
      _past: [],
      _future: [],

      add(label) {
        const { labels, _past } = get();
        set({
          _past: [..._past.slice(-MAX_HISTORY + 1), snapshot(labels)],
          _future: [],
          labels: [...labels, { ...label, id: crypto.randomUUID() }],
        });
      },

      update(id, patch) {
        const { labels, _past } = get();
        set({
          _past: [..._past.slice(-MAX_HISTORY + 1), snapshot(labels)],
          _future: [],
          labels: labels.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        });
      },

      remove(id) {
        const { labels, _past } = get();
        set({
          _past: [..._past.slice(-MAX_HISTORY + 1), snapshot(labels)],
          _future: [],
          labels: labels.filter((l) => l.id !== id),
        });
      },

      undo() {
        const { _past, labels, _future } = get();
        if (_past.length === 0) return;
        const prev = _past[_past.length - 1];
        set({
          _past: _past.slice(0, -1),
          labels: prev,
          _future: [snapshot(labels), ..._future],
        });
      },

      redo() {
        const { _future, labels, _past } = get();
        if (_future.length === 0) return;
        const next = _future[0];
        set({
          _future: _future.slice(1),
          labels: next,
          _past: [..._past.slice(-MAX_HISTORY + 1), snapshot(labels)],
        });
      },
    }),
    {
      name: 'signal-scope-labels',
      // Only persist labels — undo/redo history is session-only
      partialize: (state) => ({ labels: state.labels }),
    },
  ),
);
