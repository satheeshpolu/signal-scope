const YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t border-border-default bg-surface-950">
      <div className="mx-auto px-6 py-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Left: brand */}
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <span className="text-sm font-semibold text-text-primary">SignalScope</span>
          </div>

          {/* Center: copyright + data attribution */}
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-xs text-text-muted">
              &copy; {YEAR} SignalScope. All rights reserved.
            </span>
            <p className="text-xs text-text-muted">
              Market data sourced from the{' '}
              <a
                href="https://www.binance.com/en/binance-api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 underline-offset-2 hover:underline"
              >
                Binance public API
              </a>
            </p>
          </div>

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
