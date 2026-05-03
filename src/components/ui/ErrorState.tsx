import { Button } from '@/components/ui/Button';
import { WarningIcon } from '@/components/icons';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong.', onRetry }: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-16 text-danger-500"
      role="alert"
    >
      <WarningIcon className="h-10 w-10 opacity-70" />
      <p className="text-sm text-text-secondary">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
