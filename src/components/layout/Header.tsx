import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

function SignalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-7 w-7 text-primary-400"
    >
      <polyline points="2 16 7 10 12 14 17 6 22 10" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 overflow-hidden border-b border-border-default bg-surface-950/150 backdrop-blur-sm">
      {/* flash sweep */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-primary-400/10 to-transparent" />
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-3">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600/20">
            <SignalIcon />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-none tracking-tight text-text-primary">
              SignalScope
            </h1>
            <p className="mt-0.5 animate-pulse text-md text-gray-500 [animation-duration:2s]">
              Crypto signal inspection tool
            </p>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
