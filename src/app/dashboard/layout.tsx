// src/app/dashboard/layout.tsx
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import prisma from '@/lib/prisma';
import { getEmployeesForBusiness } from '@/(features)/employees/employee.queries';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect('/sign-in');
  }

  const header = await headers();
  const pathname = header.get('next-url') || '';
  const isNavDisabled = pathname.includes('/onboarding');

  // The data fetching logic is now much cleaner
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      business: true,
    },
  });

  // 1. Centralized Redirect Logic
  // If the user is trying to access a business page but has no business, redirect to onboarding.
  if (!dbUser?.businessId && !isNavDisabled) {
    redirect('/dashboard/onboarding');
  }

  // 2. Prevent accessing onboarding if already onboarded.
  // This redirects to `/dashboard`, which then correctly routes to their business page.
  if (dbUser?.businessId && isNavDisabled) {
    redirect(`/dashboard/${dbUser.business}`);
  }

  const business = dbUser?.business ?? null;
  // We now call our dedicated query function to get the employees
  const employees = await getEmployeesForBusiness(business?.id ?? null);

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
    <SidebarProvider>
      <AppSidebar
        isNavDisabled={isNavDisabled}
        business={business}
        user={userDetails}
        employees={employees} // Pass the fetched employees to the sidebar
        businessId={business?.id ?? null}
      />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
