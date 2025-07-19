// app/dashboard/[businessName]/appointments/page.tsx
import { Suspense } from 'react';
import CustomCalendar from './_components/CustomCalendar';
import { Skeleton } from '@/components/ui/skeleton';
import { getAppointmentsForBusiness } from '@/(features)/appointments/appointment.queries';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

type AppointmentsPageProps = {
  params: {
    businessName: string;
  };
};

// This async component will fetch the data and suspend while waiting.
async function AppointmentsCalendar({
  businessName,
}: {
  businessName: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }
  const appointments = await getAppointmentsForBusiness(businessName, userId);
  return (
    <CustomCalendar
      appointmentsData={appointments}
      businessName={businessName}
    />
  );
}

// A simple skeleton loader for the calendar view.
function CalendarSkeleton() {
  return (
    <div className='flex flex-col h-full'>
      {/* Header Skeleton */}
      <div className='flex items-center justify-between flex-shrink-0 px-4 py-3 border-b'>
        <div className='flex items-center gap-x-2'>
          <Skeleton className='h-8 w-16' />
          <Skeleton className='h-9 w-9' />
          <Skeleton className='h-9 w-9' />
        </div>
        <Skeleton className='h-6 w-32' />
        <div className='w-[124px]'></div>
      </div>
      {/* Body Skeleton */}
      <div className='flex-1 p-4'>
        <Skeleton className='h-full w-full' />
      </div>
    </div>
  );
}

export default async function AppointmentsPage({
  params,
}: AppointmentsPageProps) {
  params = await params;
  return (
    <main className='h-full'>
      <Suspense fallback={<CalendarSkeleton />}>
        <AppointmentsCalendar businessName={params.businessName} />
      </Suspense>
    </main>
  );
}
