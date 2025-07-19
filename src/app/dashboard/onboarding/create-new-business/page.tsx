// src/app/dashboard/onboarding/create-new-business/page.tsx
'use client';

import { useActionState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import { ArrowLeft, Terminal, UploadCloud, X } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// --- NEW IMPORTS ---
import { createBusiness } from '@/(features)/onboarding/onboarding.actions';
import { CreateBusinessSchema } from '@/(features)/onboarding/onboarding.schemas';
import { type CreateBusinessFormValues } from '@/(features)/onboarding/onboarding.types';

export default function CreateNewBusinessPage() {
  const [state, formAction, isPending] = useActionState(
    createBusiness,
    undefined
  );
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const router = useRouter();

  const form = useForm<CreateBusinessFormValues>({
    resolver: zodResolver(CreateBusinessSchema),
    defaultValues: {
      name: '',
      businessType: 'mobile',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      website: '',
      description: '',
      logo: undefined,
      location: '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (!state) return;

    if (state.data?.businessName) {
      toast.success(state.data.message);
      const businessSlug = encodeURIComponent(
        state.data.businessName.toLowerCase().replace(/\s+/g, '-')
      );
      const timer = setTimeout(() => {
        router.push(`/dashboard/${businessSlug}`);
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (state.validationErrors) {
      Object.entries(state.validationErrors).forEach(([field, errors]) => {
        if (errors) {
          form.setError(field as keyof CreateBusinessFormValues, {
            type: 'server',
            message: errors.join(', '),
          });
        }
      });
      toast.error('Please correct the errors in the form.');
    } else if (state.serverError) {
      toast.error(state.serverError);
    }
  }, [state, router, form]);

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
        const address = street_number ? `${street_number} ${route}` : route;

        form.setValue('address', address, { shouldValidate: true });
        form.setValue('city', get('locality'), { shouldValidate: true });
        form.setValue('state', get('administrative_area_level_1'), {
          shouldValidate: true,
        });
        form.setValue('zipCode', get('postal_code'), { shouldValidate: true });
        if (place.geometry?.location) {
          form.setValue(
            'location',
            JSON.stringify(place.geometry.location.toJSON()),
            { shouldValidate: true }
          );
        }
      }
    }
  };

  const businessTypes = [
    {
      value: 'mobile',
      label: 'Mobile Only',
      description: 'Service customers at their location',
    },
    {
      value: 'shop',
      label: 'Shop Only',
      description: 'Customers come to your fixed location',
    },
    {
      value: 'both',
      label: 'Mobile & Shop',
      description: 'Offer both mobile and in-shop services',
    },
  ];

  const googleMapsApiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;

  if (!googleMapsApiKey) {
    return <div>Error: Google Maps API key is missing.</div>;
  }

  // The onSubmit handler now passes the typed data object directly to the action.
  const onSubmit: SubmitHandler<CreateBusinessFormValues> = data => {
    formAction(data);
  };

  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={['places']}>
      <main className='flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8'>
        <div className='w-full max-w-2xl space-y-6'>
          <div className='flex items-center space-x-4'>
            <Button variant='outline' size='icon' asChild>
              <Link href='/dashboard/onboarding'>
                <ArrowLeft className='h-4 w-4' />
              </Link>
            </Button>
            <h1 className='text-2xl font-bold'>Create New Business</h1>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              <Card>
                <CardHeader>
                  <CardTitle>Business Profile</CardTitle>
                  <CardDescription>
                    Set up your detailing business profile on DetailFlow.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {state?.serverError && (
                    <Alert variant='destructive'>
                      <Terminal className='h-4 w-4' />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{state.serverError}</AlertDescription>
                    </Alert>
                  )}
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            required
                            placeholder='e.g., Elite Auto Detailing'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='logo'
                    render={({ field: { onChange, value, ...rest } }) => (
                      <FormItem>
                        <FormLabel>Business Logo</FormLabel>
                        <div className='relative mt-2 h-24 w-24'>
                          {value ? (
                            <>
                              <Image
                                src={URL.createObjectURL(value)}
                                alt='Business Logo Preview'
                                fill
                                className='object-contain rounded-lg'
                              />
                              <Button
                                type='button'
                                variant='destructive'
                                size='icon'
                                className='absolute right-0 top-0 z-10 h-6 w-6 -translate-y-1/2 translate-x-1/2 rounded-full cursor-pointer transition-all hover:scale-110 hover:rotate-6'
                                onClick={() =>
                                  form.setValue('logo', undefined, {
                                    shouldValidate: true,
                                  })
                                }
                              >
                                <X className='h-4 w-4' />
                              </Button>
                            </>
                          ) : (
                            <label
                              htmlFor='logo-upload'
                              className='flex h-full w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground bg-muted text-muted-foreground transition-colors hover:border-primary'
                            >
                              <div className='flex flex-col items-center'>
                                <UploadCloud className='h-8 w-8' />
                                <span className='mt-1 text-xs'>Upload</span>
                              </div>
                            </label>
                          )}
                        </div>
                        <FormControl>
                          <Input
                            id='logo-upload'
                            type='file'
                            className='sr-only'
                            accept='image/png, image/jpeg, image/gif, image/webp'
                            {...rest}
                            onChange={e => {
                              const file = e.target.files?.[0];
                              onChange(file);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='businessType'
                    render={({ field }) => (
                      <FormItem className='space-y-3'>
                        <FormLabel>Business Type *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className='grid grid-cols-1 gap-4 md:grid-cols-3'
                          >
                            {businessTypes.map(type => (
                              <FormControl key={type.value}>
                                <Label
                                  className={cn(
                                    'flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4 transition-colors hover:bg-accent hover:text-accent-foreground',
                                    field.value === type.value &&
                                      'border-primary bg-accent'
                                  )}
                                >
                                  <RadioGroupItem
                                    value={type.value}
                                    className='sr-only'
                                  />
                                  <span className='font-semibold'>
                                    {type.label}
                                  </span>
                                  <FormDescription className='text-sm text-center'>
                                    {type.description}
                                  </FormDescription>
                                </Label>
                              </FormControl>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='address'
                      render={({ field }) => (
                        <FormItem className='md:col-span-2'>
                          <FormLabel>Street Address *</FormLabel>
                          <FormControl>
                            <Autocomplete
                              onLoad={onLoad}
                              onPlaceChanged={onPlaceChanged}
                            >
                              <Input
                                placeholder='123 Main St'
                                {...field}
                                required
                              />
                            </Autocomplete>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='city'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder='Anytown' />
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
                          <FormLabel>State / Province *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder='CA' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='zipCode'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip / Postal Code *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder='12345' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='phone'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type='tel'
                              placeholder='(123) 456-7890'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name='website'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type='url'
                            placeholder='https://example.com'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder='Tell us about your business'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='location'
                    render={({ field }) => (
                      <FormItem className='sr-only'>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type='submit' disabled={isPending} className='w-full'>
                    {isPending ? 'Creating Business...' : 'Create Business'}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>

          <Separator />

          <div className='text-center text-sm'>
            <span className='text-muted-foreground'>
              Already part of a business?{' '}
            </span>
            <Link
              href='/dashboard/onboarding/join-business'
              className='font-semibold text-primary underline-offset-4 hover:underline'
            >
              Join an existing one
            </Link>
          </div>
        </div>
      </main>
    </LoadScript>
  );
}
