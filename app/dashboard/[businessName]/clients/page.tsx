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

// We will create this client component in a later step
// import { ClientTable } from "./_components/ClientTable";

type ClientsPageProps = {
  params: {
    businessName: string;
  };
};

// This function runs on the server to fetch data
async function getClientsForBusiness(businessSlug: string) {
  // A real implementation would find the business by its unique slug,
  // then get its clients. For now, this is a placeholder.
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
          <CardDescription>
            A table of all your clients will be displayed here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* We will replace this with the interactive <ClientTable /> component later */}
          <div className='p-4 text-sm text-center border-2 border-dashed rounded-lg'>
            <p className='mb-2 text-muted-foreground'>Raw Client Data:</p>
            <pre className='text-left bg-muted p-4 rounded-md overflow-x-auto'>
              {clients.length > 0
                ? JSON.stringify(clients, null, 2)
                : 'No clients found.'}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
