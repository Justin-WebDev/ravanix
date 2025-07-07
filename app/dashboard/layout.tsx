'use client';

import { usePathname } from 'next/navigation';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isNavDisabled = pathname.includes('/onboarding');

  return (
    <SidebarProvider>
      <AppSidebar isNavDisabled={isNavDisabled} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
