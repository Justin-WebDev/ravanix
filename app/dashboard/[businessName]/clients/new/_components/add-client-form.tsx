// app/dashboard/[businessName]/clients/new/_components/add-client-form.tsx
'use client';

import { useActionState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form'; // Import FormProvider
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { LoadScript } from '@react-google-maps/api';

import { createClient } from '../../_actions/client.actions';
import {
  CreateClientSchema,
  type CreateClientFormValues,
} from '../../_actions/client.schemas';

import { Button } from '@/components/ui/button';
// Removed unused Card components as they are now in child components

// Import the new modular form components
import { ClientInfoForm } from './ClientInfoForm';
import { ClientAddressForm } from './ClientAddressForm';
import { ClientVehiclesForm } from './ClientVehiclesForm';

type AddClientFormProps = {
  business: {
    id: string;
    name: string;
  };
};

const libraries: 'places'[] = ['places'];

export function AddClientForm({ business }: AddClientFormProps) {
  const [state, formAction, isPending] = useActionState(
    createClient,
    undefined
  );

  // The useForm hook now returns all methods, which we will pass via FormProvider
  const methods = useForm<CreateClientFormValues>({
    resolver: zodResolver(CreateClientSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      vehicles: [
        {
          make: '',
          model: '',
          year: new Date().getFullYear(),
          color: '',
          plate: '',
          vin: '',
          notes: '',
        },
      ],
    },
  });

  useEffect(() => {
    if (!state) return;

    if (state.data) {
      toast.success(state.data.message);
      methods.reset();
    }
    if (state.serverError) {
      toast.error(state.serverError);
    }
    if (state.validationErrors) {
      for (const [field, errors] of Object.entries(state.validationErrors)) {
        if (errors) {
          methods.setError(field as keyof CreateClientFormValues, {
            type: 'server',
            message: errors.join(', '),
          });
        }
      }
    }
  }, [state, methods]);

  const onSubmit = (data: CreateClientFormValues) => {
    formAction({
      ...data,
      name: `${data.firstName} ${data.lastName}`.trim(),
      businessId: business.id,
      address: data.address ?? '',
    });
  };

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    return <div>Error: Google Maps API key is not configured.</div>;
  }

  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={libraries}>
      {/* Wrap everything in the FormProvider */}
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-8'>
          {/* Render the modular form sections. They will now get form context automatically */}
          <ClientInfoForm />
          <ClientAddressForm />
          <ClientVehiclesForm />

          <div className='flex justify-end'>
            <Button type='submit' disabled={isPending}>
              {isPending ? 'Saving Client...' : 'Save Client'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </LoadScript>
  );
}
