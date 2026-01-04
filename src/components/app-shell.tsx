'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
}

export function AppShell({ children, title, actions }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Header
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
          actions={actions}
        />

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
