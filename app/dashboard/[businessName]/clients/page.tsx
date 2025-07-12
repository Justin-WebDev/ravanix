import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// We will create this client component next
// import { ClientTable } from "./_components/ClientTable";

type ClientsPageProps = {
  params: {
    businessName: string;
  };
};

// This function runs on the server to fetch data
async function getClientsForBusiness(businessSlug: string) {
  // In a real app, you would find the business by its slug, then get its clients
  // For now, we fetch all clients as an example
  const clients = await prisma.client.findMany({
    // where: {
    //   business: {
    //     name: {
    //       equals: decodeURIComponent(businessSlug),
    //       mode: 'insensitive'
    //     }
    //   }
    // }
  });
  return clients;
}

export default async function ClientsPage({ params }: ClientsPageProps) {
  params = await params;
  const clients = await getClientsForBusiness(params.businessName);

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold'>Clients</h1>
          <p className='text-muted-foreground'>Manage your customer list.</p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/${params.businessName}/clients/new`}>
            Add New Client
          </Link>
        </Button>
      </div>

      {/* This is where our client-side table component will go.
        For now, we can just display a message.
        We will create the <ClientTable /> component in the next step.
      */}
      <div className='p-8 text-center border-2 border-dashed rounded-lg'>
        <p>Client table will be displayed here.</p>
        <pre className='mt-4 text-left bg-muted p-4 rounded-md overflow-x-auto'>
          {JSON.stringify(clients, null, 2)}
        </pre>
      </div>
    </div>
  );
}
