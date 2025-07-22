// src/app/dashboard/[businessName/clients/new/_components/ClientAddressForm.tsx
'use client';

import { useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const libraries: 'places'[] = ['places'];

function AddressFormFields() {
  const form = useFormContext();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onLoad = (ac: google.maps.places.Autocomplete) => {
    autocompleteRef.current = ac;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      const components = place.address_components;
      if (components) {
        const get = (type: string) =>
          components.find(c => c.types.includes(type))?.long_name || '';
        const street_number = get('street_number');
        const route = get('route');

        form.setValue('address', `${street_number} ${route}`.trim(), {
          shouldValidate: true,
        });
        form.setValue('city', get('locality'), { shouldValidate: true });
        form.setValue('state', get('administrative_area_level_1'), {
          shouldValidate: true,
        });
        form.setValue('zipCode', get('postal_code'), { shouldValidate: true });
      }
    }
  };

  return (
    <>
      <FormField
        control={form.control}
        name='address'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street Address *</FormLabel>
            <FormControl>
              <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                <Input
                  placeholder='Start typing a street address...'
                  {...field}
                />
              </Autocomplete>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <FormField
          control={form.control}
          name='city'
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} readOnly placeholder='City' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='state'
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input {...field} readOnly placeholder='State' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='zipCode'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zip Code</FormLabel>
              <FormControl>
                <Input {...field} readOnly placeholder='Zip Code' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}

function AddressFormSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-1/4' />
        <Skeleton className='h-9 w-full' />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-1/2' />
          <Skeleton className='h-9 w-full' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-1/2' />
          <Skeleton className='h-9 w-full' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-1/2' />
          <Skeleton className='h-9 w-full' />
        </div>
      </div>
    </div>
  );
}

export const ClientAddressForm = () => {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;

  if (!googleMapsApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-3 text-lg'>
            <MapPin className='w-5 h-5 text-destructive' /> Client Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-destructive'>
            Google Maps API key is not configured.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-3 text-lg'>
          <MapPin className='w-5 h-5 text-primary' /> Client Address
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <LoadScript
          googleMapsApiKey={googleMapsApiKey}
          libraries={libraries}
          loadingElement={<AddressFormSkeleton />}
        >
          <AddressFormFields />
        </LoadScript>
      </CardContent>
    </Card>
  );
};
