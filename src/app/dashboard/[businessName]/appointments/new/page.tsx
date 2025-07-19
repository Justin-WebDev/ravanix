// src/app/dashboard/[businessName]/appointments/new/page.tsx
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getClientsForSelect } from '@/(features)/clients/client.queries';
import { NewAppointmentForm } from './_components/NewAppointmentForm';

export default async function NewAppointmentPage({
  params,
  searchParams,
}: {
  params: { businessName: string };
  searchParams: { start?: string; end?: string };
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }
  params = await params;
  searchParams = await searchParams;
  // --- REFACTORED DATA FETCHING ---
  // 1. Fetch the user and their associated business directly.
  const userWithBusiness = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      business: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // 2. Get the business from the user data.
  const business = userWithBusiness?.business;

  // 3. Verify the user has a business and it matches the one in the URL.
  const requestedBusinessName = decodeURIComponent(
    params.businessName.replace(/-/g, ' ')
  );
  if (
    !business ||
    business.name.toLowerCase() !== requestedBusinessName.toLowerCase()
  ) {
    // If user has no business or is trying to access a different business's page,
    // show a not found page. This is more secure than redirecting.
    notFound();
  }

  // Fetch the list of clients to pass to the form
  const clients = await getClientsForSelect(business.id);

  return (
    <div className='space-y-6'>
      <header className='flex items-center gap-4'>
        <Button variant='outline' size='icon' asChild>
          <Link href={`/dashboard/${params.businessName}/appointments`}>
            <ArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
        <div>
          <h1 className='text-2xl font-bold'>Create New Appointment</h1>
          <p className='text-muted-foreground'>
            Schedule a new appointment for {business.name}.
          </p>
        </div>
      </header>

      <div className='mx-auto w-full max-w-4xl'>
        <NewAppointmentForm
          businessId={business.id}
          clients={clients}
          preselectedStartTime={searchParams.start}
          preselectedEndTime={searchParams.end}
        />
      </div>
    </div>
  );
}
