import { cn } from '@/components/ui/cn';
import { useTheme } from '@/lib/theme/ThemeContext';
import { SunIcon, MoonIcon } from '@/components/icons';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md',
        'text-text-secondary transition-colors duration-150',
        'hover:bg-surface-800 hover:text-text-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
        'cursor-pointer',
        className,
      )}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
