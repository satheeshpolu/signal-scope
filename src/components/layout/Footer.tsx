const YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t border-border-default bg-surface-700">
      <div className="mx-auto px-6 py-4 text-center">
        <span className="text-md text-text-muted">
          &copy; {YEAR} SignalScope. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
