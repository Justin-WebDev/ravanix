'use client';

import {
  useActionState,
  useEffect,
  useState,
  useTransition,
  useRef,
} from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod/v4';
import { CalendarIcon, PlusCircle, Trash2, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { LoadScript } from '@react-google-maps/api';

import { cn } from '@/lib/utils';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { createAppointment } from '@/(features)/appointments/appointment.actions';
import { CreateAppointmentSchema } from '@/(features)/appointments/appointment.schemas';
import { type ClientForSelect } from '@/(features)/clients/client.queries';
import { type SelectOption } from '@/(features)/vehicles/vehicle.types';
import { AddClientFormModal } from './AddClientFormModal';
import { getVehiclesForClientAction } from '@/(features)/vehicles/vehicle.actions';

const libraries: 'places'[] = ['places'];

type NewAppointmentFormValues = z.infer<typeof CreateAppointmentSchema>;

type NewAppointmentFormProps = {
  businessId: string;
  clients: ClientForSelect[];
  preselectedStartTime?: string;
  preselectedEndTime?: string;
};

export function NewAppointmentForm({
  businessId,
  clients: initialClients,
  preselectedStartTime,
  preselectedEndTime,
}: NewAppointmentFormProps) {
  const router = useRouter();
  const params = useParams<{ businessName: string }>();
  const [state, formAction, isPending] = useActionState(
    createAppointment,
    undefined
  );

  const [clients, setClients] = useState<ClientForSelect[]>(initialClients);
  const [vehicles, setVehicles] = useState<SelectOption[]>([]);
  const [isVehiclesLoading, startVehicleTransition] = useTransition();
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const prevIsPending = useRef(false);

  const form = useForm<NewAppointmentFormValues>({
    resolver: zodResolver(CreateAppointmentSchema) as any,
    defaultValues: {
      businessId,
      clientId: '',
      vehicleId: '',
      startTime: preselectedStartTime
        ? new Date(preselectedStartTime)
        : new Date(),
      endTime: preselectedEndTime ? new Date(preselectedEndTime) : new Date(),
      status: 'Scheduled',
      notes: '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  const selectedClientId = form.watch('clientId');

  useEffect(() => {
    if (!selectedClientId) {
      setVehicles([]);
      return;
    }
    startVehicleTransition(async () => {
      form.setValue('vehicleId', '');
      const fetchedVehicles =
        await getVehiclesForClientAction(selectedClientId);
      setVehicles(fetchedVehicles);
    });
  }, [selectedClientId, form]);

  useEffect(() => {
    if (prevIsPending.current && !isPending && state?.data) {
      toast.success(state.data.message);
      router.push(`/dashboard/${params.businessName}/appointments`);
    }
    if (
      prevIsPending.current &&
      !isPending &&
      (state?.serverError || state?.validationErrors)
    ) {
      toast.error(
        state.serverError || 'Please correct the errors in the form.'
      );
      if (state.validationErrors) {
        Object.entries(state.validationErrors).forEach(([field, errors]) => {
          if (errors) {
            form.setError(field as keyof NewAppointmentFormValues, {
              type: 'server',
              message: errors.join(', '),
            });
          }
        });
      }
    }
    prevIsPending.current = isPending;
  }, [state, isPending, router, params.businessName, form]);

  const handleClientCreated = (newClient: ClientForSelect) => {
    setClients(currentClients =>
      [...currentClients, newClient].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );
    form.setValue('clientId', newClient.id, { shouldValidate: true });
    setIsAddClientOpen(false);
  };

  const onSubmit = (data: NewAppointmentFormValues) => {
    formAction(data);
  };

  return (
    // We remove LoadScript from here as it's now inside the modal form
    <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='clientId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select
                        onValueChange={value => {
                          if (value === 'add-new-client') {
                            setIsAddClientOpen(true);
                            // Do not change the actual form value, keep the current selection
                            field.onChange(field.value);
                          } else {
                            field.onChange(value);
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select a client' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                          <SelectSeparator />
                          <SelectItem
                            value='add-new-client'
                            className='text-primary focus:text-primary'
                          >
                            <div className='flex items-center gap-2'>
                              <UserPlus className='h-4 w-4' />
                              <span>Add New Client</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='vehicleId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedClientId || isVehiclesLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isVehiclesLoading
                                  ? 'Loading...'
                                  : 'Select a vehicle'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicles.map(vehicle => (
                            <SelectItem
                              key={vehicle.value}
                              value={vehicle.value}
                            >
                              {vehicle.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='startTime'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>Start Time</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='endTime'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>End Time</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='Scheduled'>Scheduled</SelectItem>
                        <SelectItem value='In Progress'>In Progress</SelectItem>
                        <SelectItem value='Finished'>Finished</SelectItem>
                        <SelectItem value='Unpaid'>Unpaid</SelectItem>
                        <SelectItem value='Paid'>Paid</SelectItem>
                        <SelectItem value='Quoted'>Quoted</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Add any notes for this appointment...'
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
            <CardHeader>
              <CardTitle>Services & Items</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {fields.map((field, index) => (
                <div key={field.id} className='flex items-end gap-4'>
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <FormLabel className={index > 0 ? 'sr-only' : ''}>
                          Description
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder='Service or Item Name'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className='w-20'>
                        <FormLabel className={index > 0 ? 'sr-only' : ''}>
                          Qty
                        </FormLabel>
                        <FormControl>
                          <Input type='number' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.unitPrice`}
                    render={({ field }) => (
                      <FormItem className='w-24'>
                        <FormLabel className={index > 0 ? 'sr-only' : ''}>
                          Price
                        </FormLabel>
                        <FormControl>
                          <Input type='number' step='0.01' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => remove(index)}
                    className={fields.length === 1 ? 'invisible' : ''}
                  >
                    <Trash2 className='h-4 w-4 text-destructive' />
                  </Button>
                </div>
              ))}
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() =>
                  append({ description: '', quantity: 1, unitPrice: 0 })
                }
              >
                <PlusCircle className='mr-2 h-4 w-4' />
                Add Item
              </Button>
            </CardContent>
          </Card>
          <div className='flex justify-end'>
            <Button type='submit' disabled={isPending}>
              {isPending ? 'Creating Appointment...' : 'Create Appointment'}
            </Button>
          </div>
        </form>
      </Form>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Client</DialogTitle>
        </DialogHeader>
        <AddClientFormModal
          businessId={businessId}
          onSuccess={handleClientCreated}
        />
      </DialogContent>
    </Dialog>
  );
}
