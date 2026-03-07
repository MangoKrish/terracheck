import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal top bar */}
      <nav className="h-16 flex items-center justify-between px-6 border-b border-border bg-surface">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-foreground tracking-tight">TerraCheck</span>
        </div>
        <a
          href="/auth/login"
          className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          Sign In
        </a>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 text-primary text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Built for Canadian land development
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight tracking-tight">
            Know your land
            <br />
            <span className="text-primary">before you build.</span>
          </h1>

          <p className="mt-5 text-lg text-muted leading-relaxed max-w-md mx-auto">
            Drop a pin on any location in Canada and get an instant environmental and regulatory viability report.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/assess"
              className="px-6 py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm"
            >
              Start an Assessment
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-surface text-foreground border border-border rounded-lg text-sm font-medium hover:bg-surface-hover transition-colors"
            >
              View Dashboard
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex items-center justify-center gap-8 text-xs text-muted-light">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Secure & private
            </div>
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              Results in seconds
            </div>
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Canada-wide coverage
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
