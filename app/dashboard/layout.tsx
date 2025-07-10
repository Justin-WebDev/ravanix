import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import prisma from '@/lib/prisma';
import { NavEmployees } from '@/components/nav-employees'; // Import NavEmployees
import { AblyReactProvider } from '@/components/ably-provider';

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
    where: { id: userId },
    include: {
      business: {
        include: {
          employees: {
            // where: {
            //   id: { not: userId },
            // },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });

  const business = dbUser?.business ?? null;
  const employees = dbUser?.business?.employees ?? [];

  const userDetails = {
    name: user.firstName
      ? `${user.firstName} ${user.lastName ?? ''}`.trim()
      : user.emailAddresses[0].emailAddress,
    email: user.emailAddresses[0].emailAddress,
    avatar: user.imageUrl,
    role: (user.publicMetadata.role as string) || 'user',
    id: user.id,
  };

  return (
    <AblyReactProvider>
      <SidebarProvider>
        <AppSidebar
          isNavDisabled={isNavDisabled}
          business={business}
          user={userDetails}
          employees={employees}
          businessId={business?.id ?? null}
        />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </AblyReactProvider>
  );
}
