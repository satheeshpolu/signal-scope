const YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t border-border-default bg-surface-950">
      <div className="mx-auto max-w-screen-xl px-6 py-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Left: brand + copy */}
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <span className="text-sm font-semibold text-text-primary">SignalScope</span>
            <span className="text-xs text-text-muted">
              &copy; {YEAR} SignalScope. All rights reserved.
            </span>
          </div>

          {/* Center: data attribution */}
          <p className="text-center text-xs text-text-muted">
            Market data sourced from the{' '}
            <a
              href="https://www.binance.com/en/binance-api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 underline-offset-2 hover:underline"
            >
              Binance public API
            </a>
            . For informational purposes only — not financial advice.
          </p>

          {/* Right: links */}
          <nav aria-label="Footer navigation" className="flex items-center gap-4 text-xs">
            <a
              href="https://binance-docs.github.io/apidocs/spot/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted transition-colors hover:text-text-primary"
            >
              API Docs
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
