// app/dashboard/[businessName]/clients/page.tsx
import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
// We will create this table component in the next step
import { ClientTable, type ClientData } from './_components/ClientTable';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

type ClientsPageProps = {
  params: {
    businessName: string;
  };
};

// This function runs on the server to fetch the client data.
async function getClientsForBusiness(
  businessName: string
): Promise<ClientData[]> {
  const { userId } = await auth();
  if (!userId) {
    // This case should ideally not be reached due to layout protection
    return [];
  }

  // Find the business by its URL-decoded name and owner
  // In a multi-tenant app, ensuring the logged-in user owns the business is crucial.
  const business = await prisma.business.findFirst({
    where: {
      name: decodeURIComponent(businessName),
      ownerId: userId, // Security check
    },
    select: { id: true },
  });

  if (!business) {
    // Handle case where business is not found or user is not the owner
    return [];
  }

  const clients = await prisma.client.findMany({
    where: {
      businessId: business.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return clients;
}

export default async function ClientsPage({ params }: ClientsPageProps) {
  params = await params;
  const clients = await getClientsForBusiness(params.businessName);

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
          <ClientTable data={clients} />
        </CardContent>
      </Card>
    </div>
  );
}
