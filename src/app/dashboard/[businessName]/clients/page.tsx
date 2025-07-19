// src/app/dashboard/[businessName]/clients/page.tsx
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ClientTable } from './_components/ClientTable';
import { Skeleton } from '@/components/ui/skeleton';

// --- NEW IMPORTS ---
import { getClientsForBusiness } from '@/(features)/clients/client.queries';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { type ClientData } from '@/(features)/clients/client.types';

type ClientsPageProps = {
  params: {
    businessName: string;
  };
};

// A simple skeleton loader for our table
function ClientTableSkeleton() {
  return (
    <div className='space-y-2'>
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-10 w-full' />
    </div>
  );
}

// This async component fetches the data and will suspend while waiting.
async function ClientList({ businessName }: { businessName: string }) {
  // Get the userId here, *outside* the cached function
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // Pass the userId as an argument to the query
  const clients: ClientData[] = await getClientsForBusiness(
    businessName,
    userId
  );
  return <ClientTable data={clients} />;
}

export default async function ClientsPage({ params }: ClientsPageProps) {
  params = await params;
  return (
    <div className='p-4 sm:p-6 lg:p-8 space-y-6'>
      <header className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Clients</h1>
          <p className='text-muted-foreground'>
            View and manage your customer list.
          </p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/${params.businessName}/clients/new`}>
            Add New Client
          </Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
          <CardDescription>A list of all your customers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ClientTableSkeleton />}>
            <ClientList businessName={params.businessName} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
