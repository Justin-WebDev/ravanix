// src/app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TriangleAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center'>
      <div className='space-y-4'>
        <TriangleAlert className='mx-auto h-16 w-16 text-primary' />
        <h1 className='text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>
          Page Not Found
        </h1>
        <p className='max-w-md text-muted-foreground'>
          Sorry, we couldn’t find the page you’re looking for. It might have
          been moved, deleted, or maybe you just mistyped the URL.
        </p>
        <Button asChild>
          <Link href='/dashboard'>Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
