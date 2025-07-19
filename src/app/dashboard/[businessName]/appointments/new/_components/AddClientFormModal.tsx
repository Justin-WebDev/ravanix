// src/app/dashboard/[businessName]/appointments/new/_components/AddClientFormModal.tsx
'use client';

import { useActionState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { createClient } from '@/(features)/clients/client.actions';
import {
  ClientFormSchema,
  CreateClientFormValues,
} from '@/(features)/clients/client.schemas';
import { type ClientForSelect } from '@/(features)/clients/client.queries';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { GoogleMapsAddressInput } from '@/components/shared/GoogleMapsAddressInput';

type AddClientFormModalProps = {
  businessId: string;
  onSuccess: (newClient: ClientForSelect) => void;
};

export function AddClientFormModal({
  businessId,
  onSuccess,
}: AddClientFormModalProps) {
  const [state, formAction, isPending] = useActionState(
    createClient,
    undefined
  );

  const methods = useForm<CreateClientFormValues>({
    resolver: zodResolver(ClientFormSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      vehicles: [],
    },
  });

  useEffect(() => {
    if (!state) return;

    if (state.data?.clientId) {
      toast.success(state.data.message);
      onSuccess({
        id: state.data.clientId,
        name: `${methods.getValues('firstName')} ${methods.getValues('lastName')}`.trim(),
      });
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
  }, [state, methods, onSuccess]);

  const onSubmit = (data: CreateClientFormValues) => {
    formAction({
      ...data,
      businessId: businessId,
    });
  };

  const handlePlaceSelected = (place: google.maps.places.PlaceResult) => {
    const components = place.address_components;
    if (components) {
      const get = (type: string) =>
        components.find(c => c.types.includes(type))?.long_name || '';
      const street_number = get('street_number');
      const route = get('route');

      methods.setValue('address', `${street_number} ${route}`.trim(), {
        shouldValidate: true,
      });
      methods.setValue('city', get('locality'), { shouldValidate: true });
      methods.setValue('state', get('administrative_area_level_1'), {
        shouldValidate: true,
      });
      methods.setValue('zipCode', get('postal_code'), { shouldValidate: true });
    }
  };

  return (
    // The <LoadScript> wrapper has been removed from here.
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className='space-y-4 pt-4'
      >
        <div className='grid gap-4 md:grid-cols-2'>
          <FormField
            control={methods.control}
            name='firstName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name *</FormLabel>
                <FormControl>
                  <Input placeholder='John' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={methods.control}
            name='lastName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name *</FormLabel>
                <FormControl>
                  <Input placeholder='Doe' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='grid gap-4 md:grid-cols-2'>
          <FormField
            control={methods.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='client@example.com'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={methods.control}
            name='phone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input type='tel' placeholder='(555) 123-4567' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={methods.control}
          name='address'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <GoogleMapsAddressInput
                  onChange={field.onChange}
                  value={field.value}
                  onPlaceSelected={handlePlaceSelected}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <FormField
            control={methods.control}
            name='city'
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={methods.control}
            name='state'
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={methods.control}
            name='zipCode'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zip Code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='flex justify-end pt-4'>
          <Button type='submit' disabled={isPending}>
            {isPending ? 'Saving Client...' : 'Save Client'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
