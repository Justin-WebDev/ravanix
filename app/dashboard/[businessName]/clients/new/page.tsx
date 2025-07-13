'use client';

import { useActionState, useEffect, use, Suspense } from 'react';
import { createClient } from '../_actions/client.actions';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import {
  ArrowLeft,
  Car,
  Mail,
  Phone,
  Trash2,
  User,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  CreateClientSchema,
  type CreateClientFormValues,
} from '../_actions/client.schemas';

export default function AddNewClientPage({
  params: paramsPromise,
}: {
  params: Promise<{ businessName: string }>;
}) {
  const params = use(paramsPromise);

  const [state, formAction, isPending] = useActionState(createClient, {
    success: false,
    message: '',
  });

  const form = useForm<CreateClientFormValues>({
    resolver: zodResolver(CreateClientSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'vehicles',
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      form.reset();
    } else if (state.message && state.errors) {
      toast.error(state.message);
    }
  }, [state, form]);

  function onSubmit(data: CreateClientFormValues) {
    const formData = new FormData();
    formData.append('jsonData', JSON.stringify(data));
    formAction(formData);
  }

  return (
    <Suspense>
      <div className='p-4 sm:p-6 lg:p-8 space-y-6'>
        <header className='flex items-center gap-4'>
          <Button variant='outline' size='icon' asChild>
            <Link href={`/dashboard/${params.businessName}/clients`}>
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </Button>
          <div>
            <h1 className='text-2xl font-bold'>Add New Client</h1>
          </div>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <User className='w-5 h-5' /> Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter client's full name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='grid gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
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
                    control={form.control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type='tel'
                            placeholder='(555) 123-4567'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <MapPin className='w-5 h-5' /> Client Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Search Full Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Start typing an address...'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between'>
                <CardTitle className='flex items-center gap-2'>
                  <Car className='w-5 h-5' /> Vehicles
                </CardTitle>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() =>
                    append({
                      make: '',
                      model: '',
                      year: new Date().getFullYear(),
                      color: '',
                      plate: '',
                      vin: '',
                      notes: '',
                    })
                  }
                >
                  Add Vehicle
                </Button>
              </CardHeader>
              <CardContent className='space-y-4'>
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className='p-4 border rounded-lg space-y-4 relative'
                  >
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                      <FormField
                        control={form.control}
                        name={`vehicles.${index}.year`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year *</FormLabel>
                            <FormControl>
                              <Input type='number' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`vehicles.${index}.make`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Make *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`vehicles.${index}.model`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Model *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`vehicles.${index}.color`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`vehicles.${index}.plate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Plate</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`vehicles.${index}.vin`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>VIN</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='absolute top-2 right-2 text-muted-foreground hover:text-destructive'
                        onClick={() => remove(index)}
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name='notes'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Any specific notes about this client...
                      </FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className='flex justify-end'>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Saving Client...' : 'Save Client'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Suspense>
  );
}
