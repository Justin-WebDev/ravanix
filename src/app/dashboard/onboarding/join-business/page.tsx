// src/app/dashboard/onboarding/join-business/page.tsx
'use client';

import { useEffect, useState, useActionState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

// --- NEW IMPORTS ---
import {
  joinBusiness,
  fetchBusinessesAction,
} from '@/(features)/onboarding/onboarding.actions';
import { type BusinessForJoining } from '@/(features)/onboarding/onboarding.types';

function searchBusinesses(
  businesses: BusinessForJoining[],
  searchTerm: string
): BusinessForJoining[] {
  if (!searchTerm) return businesses;
  const term = searchTerm.toLowerCase();
  return businesses.filter(
    business =>
      business.name.toLowerCase().includes(term) ||
      (business.location && business.location.toLowerCase().includes(term)) ||
      business.city.toLowerCase().includes(term) ||
      business.state.toLowerCase().includes(term)
  );
}

export default function JoinBusiness() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBusiness, setSelectedBusiness] =
    useState<BusinessForJoining | null>(null);
  const [businesses, setBusinesses] = useState<BusinessForJoining[]>([]);

  const [formState, formAction, isSubmitting] = useActionState(
    joinBusiness,
    null
  );

  const router = useRouter();

  useEffect(() => {
    // Use the new secure action to fetch businesses
    fetchBusinessesAction().then(businesses => setBusinesses(businesses));
  }, []);

  useEffect(() => {
    if (formState?.success) {
      toast.success(formState.message);
      setSelectedBusiness(null); // Deselect business on success
    }
    if (formState && !formState.success && formState.message) {
      toast.error(formState.message);
    }
  }, [formState, router]);

  const filteredBusinesses = searchBusinesses(businesses, searchTerm);

  const handleBusinessSelect = (business: BusinessForJoining) => {
    if (formState?.success) return;
    setSelectedBusiness(business);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (selectedBusiness) {
      formData.set('businessId', selectedBusiness.id);
    }
    formAction(formData);
  };

  const showCodeInput =
    formState?.requiresCode && formState.businessId === selectedBusiness?.id;

  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <div className='w-full max-w-2xl max-h-[90vh] min-h-[90vh] p-8 shadow-lg flex flex-col'>
        <div className='flex items-center space-x-4 mb-6'>
          <Button variant='outline' size='icon' asChild>
            <Link href='/dashboard/onboarding'>
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </Button>
          <h1 className='text-2xl font-bold'>Join Existing Business</h1>
        </div>
        <Card className='flex flex-col flex-1 min-h-0 bg-card rounded-2xl shadow-none'>
          <CardHeader>
            <CardTitle>Find and Join a Business</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col flex-1 min-h-0 space-y-6'>
            <p className='text-muted-foreground'>
              Search for a detailing business already registered. Some
              businesses may require a code to join.
            </p>
            {formState?.success && (
              <Alert variant='default'>
                <AlertTitle>Request Sent!</AlertTitle>
                <AlertDescription>{formState.message}</AlertDescription>
              </Alert>
            )}
            <form
              onSubmit={handleSubmit}
              className='flex flex-col flex-1 min-h-0 space-y-4'
            >
              <Input
                type='text'
                placeholder='Search for businesses by name or location...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                disabled={isSubmitting || !!formState?.success}
              />
              <div className='flex-1 min-h-0 space-y-2 overflow-y-auto'>
                {filteredBusinesses.length > 0 ? (
                  filteredBusinesses.map(business => (
                    <Card
                      key={business.id}
                      className={`cursor-pointer border-2 transition-all ${
                        selectedBusiness?.id === business.id
                          ? 'border-primary bg-accent'
                          : 'border-muted bg-background hover:border-primary/50'
                      } ${isSubmitting || !!formState?.success ? 'opacity-50 pointer-events-none' : ''}`}
                      onClick={() => handleBusinessSelect(business)}
                    >
                      <CardContent className='py-3 px-4'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <div className='font-semibold'>{business.name}</div>
                            <div className='text-xs text-muted-foreground'>
                              {business.location}
                            </div>
                            {business.description && (
                              <div className='text-xs mt-1 text-muted-foreground'>
                                {business.description}
                              </div>
                            )}
                          </div>
                          <span className='text-xs bg-primary/10 text-primary px-2 py-1 rounded-full capitalize'>
                            {business.businessType === 'both'
                              ? 'Mobile & Shop'
                              : `${business.businessType} Only`}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className='text-center text-muted-foreground py-4'>
                    No businesses found.
                  </div>
                )}
              </div>

              {showCodeInput && (
                <div className='space-y-2 animate-in fade-in'>
                  <label htmlFor='joinCode' className='text-sm font-medium'>
                    Join Code
                  </label>
                  <Input
                    id='joinCode'
                    name='joinCode'
                    type='text'
                    placeholder='Enter the business join code'
                    required
                    autoFocus
                  />
                </div>
              )}

              <input
                type='hidden'
                name='businessId'
                value={selectedBusiness?.id ?? ''}
              />
              <Button
                type='submit'
                className='w-full'
                disabled={
                  !selectedBusiness || isSubmitting || !!formState?.success
                }
              >
                {formState?.success
                  ? 'Request Sent'
                  : isSubmitting
                    ? 'Sending Request...'
                    : 'Request to Join Business'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Separator className='my-6' />
        <div className='text-center text-sm'>
          <span className='text-muted-foreground'>
            Want to create a new business?{' '}
          </span>
          <Link
            href='/dashboard/onboarding/create-new-business'
            className='font-semibold text-primary underline-offset-4 hover:underline'
          >
            Create one instead
          </Link>
        </div>
      </div>
    </div>
  );
}
