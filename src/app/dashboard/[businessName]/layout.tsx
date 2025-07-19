// src/app/dashboard/[businessName]/layout.tsx

import { DashboardHeader } from '@/components/shared/DashboardHeader';

export default function BusinessDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex flex-1 flex-col gap-4 p-4 sm:py-4'>
      <DashboardHeader />
      <main className='flex flex-1 flex-col gap-4'>{children}</main>
    </div>
  );
}
