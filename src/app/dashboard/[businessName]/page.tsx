// src/app/dashboard/[businessName]/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function BusinessDashboardPage({
  params,
}: {
  params: { businessName: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  params = await params;

  const businessName = decodeURIComponent(
    params.businessName.replace(/-/g, ' ')
  );

  return (
    <>
      <div>
        <h1 className='text-2xl font-bold capitalize'>
          Welcome to {businessName}
        </h1>
      </div>
      <div className='grid auto-rows-min gap-4 md:grid-cols-3'>
        <Card className='aspect-video'>
          <CardHeader>
            <CardTitle>Card 1</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card content</p>
          </CardContent>
        </Card>
        <Card className='aspect-video'>
          <CardHeader>
            <CardTitle>Card 2</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card content</p>
          </CardContent>
        </Card>
        <Card className='aspect-video'>
          <CardHeader>
            <CardTitle>Card 3</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card content</p>
          </CardContent>
        </Card>
      </div>
      <Card className='min-h-[100vh] flex-1 md:min-h-min'>
        <CardHeader>
          <CardTitle>Large Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Large card content</p>
        </CardContent>
      </Card>
    </>
  );
}
