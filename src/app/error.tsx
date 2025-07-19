// src/app/error.tsx
'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ServerCrash } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a production environment, you would log the error to a service
    // like Sentry, LogRocket, or Axiom.
    console.error(error);
  }, [error]);

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center'>
      <div className='space-y-4'>
        <ServerCrash className='mx-auto h-16 w-16 text-destructive' />
        <h1 className='text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>
          Something went wrong
        </h1>
        <p className='max-w-md text-muted-foreground'>
          We're sorry, but an unexpected error occurred. You can try to reload
          the page or return to the dashboard.
        </p>
        <div className='flex gap-4 justify-center'>
          <Button variant='outline' onClick={() => reset()}>
            Try Again
          </Button>
          <Button asChild>
            <Link href='/dashboard'>Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
