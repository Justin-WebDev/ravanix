import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import prisma from '@/lib/prisma';
import { SocketProvider } from '@/hooks/use-socket';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const header = await headers();
  const pathname = header.get('next-url') || '';
  const isNavDisabled = pathname.includes('/onboarding');

  const user = await currentUser();
  const { userId } = await auth();

  if (!userId || !user) {
    redirect('/sign-in');
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      business: {
        include: {
          members: {
            where: {
              clerkId: { not: userId },
            },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
              lastSeen: true,
            },
          },
        },
      },
    },
  });

  const business = dbUser?.business ?? null;
  const employees = dbUser?.business?.members ?? [];
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const onlineEmployees = employees.filter(
    e => e.lastSeen && e.lastSeen > fiveMinutesAgo
  );
  const offlineEmployees = employees.filter(
    e => !e.lastSeen || e.lastSeen <= fiveMinutesAgo
  );

  const userDetails = {
    name: user.firstName
      ? `${user.firstName} ${user.lastName ?? ''}`.trim()
      : user.emailAddresses[0].emailAddress,
    email: user.emailAddresses[0].emailAddress,
    avatar: user.imageUrl,
    role: (user.publicMetadata.role as string) || 'user',
  };

  return (
    <SocketProvider>
      <SidebarProvider>
        <AppSidebar
          isNavDisabled={isNavDisabled}
          business={business}
          user={userDetails}
          onlineEmployees={onlineEmployees}
          offlineEmployees={offlineEmployees}
        />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </SocketProvider>
  );
}
