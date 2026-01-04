'use client';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  actions?: React.ReactNode;
}

export function Header({ title, onMenuClick, actions }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-foreground-muted hover:bg-muted lg:hidden"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>

          <h1 className="text-xl font-semibold text-foreground">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {actions}

          {/* Notifications */}
          <button className="relative rounded-lg p-2 text-foreground-muted hover:bg-muted">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>

          {/* User menu - desktop */}
          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
              <span className="text-sm font-medium text-foreground-secondary">
                JD
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
