import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Users } from 'lucide-react';
import prisma from '@/lib/prisma';

export default async function Onboarding() {
  const { userId } = await auth();
  if (!userId) {
    // Should not happen due to middleware, but as a safeguard
    redirect('/sign-in');
  }

  // Check if the user already has a business
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (user && user.businessId) {
    redirect('/dashboard');
  }

  return (
    <main className='flex flex-1 items-center justify-center'>
      <section className='w-full max-w-4xl'>
        <Card>
          <CardHeader className='text-center'>
            <CardTitle className='text-4xl font-bold'>
              Welcome to DetailFlow
            </CardTitle>
            <div className='space-y-1 pt-1.5 text-muted-foreground'>
              <p className='text-base'>
                Let's get you set up with your detailing business.
              </p>
              <p className='text-base'>
                You can either join an existing business or create a new one.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-2'>
              <Link href='/dashboard/onboarding/join-business'>
                <Card className='flex h-full flex-col items-center justify-evenly p-6 text-center transition-all hover:border-primary'>
                  <div className='rounded-full bg-secondary p-4'>
                    <Users className='size-8' />
                  </div>
                  <div className='space-y-1.5'>
                    <CardTitle className='text-2xl font-bold'>
                      Join Existing Business
                    </CardTitle>
                    <p className='min-h-10 text-sm text-muted-foreground'>
                      Connect with a detailing business that's already using
                      DetailFlow
                    </p>
                  </div>
                </Card>
              </Link>
              <Link href='/dashboard/onboarding/create-new-business'>
                <Card className='flex h-full flex-col items-center justify-evenly p-6 text-center transition-all hover:border-primary'>
                  <div className='rounded-full bg-secondary p-4'>
                    <Sparkles className='size-8' />
                  </div>
                  <div className='space-y-1.5'>
                    <CardTitle className='text-2xl font-bold'>
                      Create New Business
                    </CardTitle>
                    <p className='min-h-10 text-sm text-muted-foreground'>
                      Set up your own detailing business on DetailFlow
                    </p>
                  </div>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
