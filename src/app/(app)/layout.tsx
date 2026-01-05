import { PageHeaderProvider } from '@/components/page-header-context';
import { AppShellLayout } from '@/components/app-shell-layout';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageHeaderProvider>
      <AppShellLayout>{children}</AppShellLayout>
    </PageHeaderProvider>
  );
}
