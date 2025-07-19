'use client';

import { useFormState, useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createBusiness, FormState } from '@/actions/business';
import { useEffect } from 'react';
import { toast } from 'sonner';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type='submit' disabled={pending} className='w-full'>
      {pending ? 'Creating...' : 'Create Business'}
    </Button>
  );
}

export function CreateBusinessForm() {
  const initialState: FormState = { message: '', success: false };
  const [state, dispatch] = useFormState(createBusiness, initialState);

  useEffect(() => {
    if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a new business</CardTitle>
        <CardDescription>
          Fill out the form below to create your business profile.
        </CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <CardContent>
          <div className='space-y-2'>
            <Label htmlFor='name'>Business Name</Label>
            <Input
              id='name'
              name='name'
              placeholder='e.g. Acme Detailing'
              required
            />
          </div>
          {state.message && !state.success && (
            <p className='mt-2 text-sm text-red-500'>{state.message}</p>
          )}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
