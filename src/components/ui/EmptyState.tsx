import { InboxIcon } from '@/components/icons';

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = 'No results found.' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-text-muted" role="status">
      <InboxIcon className="mb-3 h-10 w-10 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
