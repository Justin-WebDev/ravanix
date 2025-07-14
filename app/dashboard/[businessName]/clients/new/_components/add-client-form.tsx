// app/dashboard/[businessName]/clients/new/_components/add-client-form.tsx
'use client';

import { useActionState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Car, Trash2, User, MapPin } from 'lucide-react';

import { createClient } from '../../_actions/client.actions';
import {
  CreateClientSchema,
  type CreateClientFormValues,
} from '../../_actions/client.schemas';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

type AddClientFormProps = {
  business: {
    id: string;
    name: string;
  };
};

export function AddClientForm({ business }: AddClientFormProps) {
  const [state, formAction, isPending] = useActionState(
    createClient,
    undefined
  );

  const form = useForm<CreateClientFormValues>({
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'vehicles',
  });

  useEffect(() => {
    if (!state) return;

    if (state.data) {
      toast.success(state.data.message);
      form.reset();
    }
    if (state.serverError) {
      toast.error(state.serverError);
    }
    if (state.validationErrors) {
      for (const [field, errors] of Object.entries(state.validationErrors)) {
        if (errors) {
          form.setError(field as keyof CreateClientFormValues, {
            type: 'server',
            message: errors.join(', '),
          });
        }
      }
    }
  }, [state, form]);

  const onSubmit = (data: CreateClientFormValues) => {
    // Transform the form data to match the server action's expected shape
    const { firstName, lastName, address, city, state, zipCode, ...rest } =
      data;
    const name = `${firstName} ${lastName}`.trim();
    let fullAddress: string | undefined = undefined;
    if (address && city && state && zipCode) {
      fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
    }
    formAction({
      ...rest,
      name,
      address: fullAddress,
      businessId: business.id,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <User className='w-5 h-5' /> Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
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
                control={form.control}
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
              <FormField
                control={form.control}
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
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
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
              <MapPin className='w-5 h-5' /> Client Address (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder='123 Main St' {...field} />
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
                      <Input placeholder='Anytown' {...field} />
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
                      <Input placeholder='CA' {...field} />
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
                      <Input placeholder='12345' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                          <Input
                            type='number'
                            {...field}
                            onChange={e =>
                              field.onChange(e.target.valueAsNumber || null)
                            }
                          />
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
                  <FormField
                    control={form.control}
                    name={`vehicles.${index}.notes`}
                    render={({ field }) => (
                      <FormItem className='md:col-span-3'>
                        <FormLabel>Vehicle Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
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

        <div className='flex justify-end'>
          <Button type='submit' disabled={isPending}>
            {isPending ? 'Saving Client...' : 'Save Client'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
