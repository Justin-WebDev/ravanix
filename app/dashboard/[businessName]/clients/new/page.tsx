// app/dashboard/[businessName]/clients/new/page.tsx
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AddClientForm } from './_components/add-client-form';

/**
 * Fetches business details from the database based on its slug.
 * This is a server-side operation.
 */
async function getBusinessBySlug(slug: string) {
  const businessName = decodeURIComponent(slug.replace(/-/g, ' '));
  const business = await prisma.business.findFirst({
    where: {
      name: {
        equals: businessName,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      name: true,
    },
  });
  return business;
}

export default async function AddNewClientPage({
  params,
}: {
  params: { businessName: string };
}) {
  params = await params;
  const business = await getBusinessBySlug(params.businessName);

  if (!business) {
    notFound();
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 space-y-6'>
      <header className='flex items-center gap-4'>
        <Button variant='outline' size='icon' asChild>
          <Link href={`/dashboard/${params.businessName}/clients`}>
            <ArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
        <div>
          <h1 className='text-2xl font-bold'>Add New Client</h1>
          <p className='text-muted-foreground'>
            Add a new client record for {business.name}.
          </p>
        </div>
      </header>
      {/* We pass the server-fetched business data to our new client component. */}
      <AddClientForm business={business} />
    </div>
  );
}
