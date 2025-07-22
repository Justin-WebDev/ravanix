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
import {
  CalendarIcon,
  PlusCircle,
  Trash2,
  Check,
  ChevronsUpDown,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { LoadScript, Autocomplete } from '@react-google-maps/api';

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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

import { createAppointment } from '@/(features)/appointments/appointment.actions';
import {
  AppointmentFormSchema,
  NewAppointmentFormValues,
} from '@/(features)/appointments/appointment.schemas';
import { type ClientForSelect } from '@/(features)/clients/client.queries';
import { type SelectOption } from '@/(features)/vehicles/vehicle.types';
import { getVehiclesForClientAction } from '@/(features)/vehicles/vehicle.actions';
import { getClientDetailsAction } from '@/(features)/clients/client.actions';

const libraries: 'places'[] = ['places'];

// Helper to parse the address string
const parseFullAddress = (fullAddress: string | null) => {
  if (!fullAddress) return { address: '', city: '', state: '', zipCode: '' };
  const parts = fullAddress.split(',').map(part => part.trim());
  if (parts.length < 3) {
    return { address: fullAddress, city: '', state: '', zipCode: '' };
  }
  const address = parts[0];
  const city = parts[1];
  const stateAndZip = parts[2].split(' ');
  const state = stateAndZip[0];
  const zipCode = stateAndZip.slice(1).join(' ');
  return { address, city, state, zipCode };
};

// Helper to parse a full name into first and last names
const parseClientName = (fullName: string) => {
  const parts = fullName.split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
};

export function NewAppointmentForm({
  businessId,
  clients,
  preselectedStartTime,
  preselectedEndTime,
}: {
  businessId: string;
  clients: ClientForSelect[];
  preselectedStartTime?: string | Date | null;
  preselectedEndTime?: string | Date | null;
}) {
  const router = useRouter();
  const params = useParams<{ businessName: string }>();
  const [state, formAction, isPending] = useActionState(
    createAppointment,
    undefined
  );

  const [vehicles, setVehicles] = useState<SelectOption[]>([]);
  const [isVehiclesLoading, startVehicleTransition] = useTransition();
  const [isFetchingClient, startClientFetchTransition] = useTransition();
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Add a ref for the input element to measure its width and position
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<NewAppointmentFormValues>({
    resolver: zodResolver(AppointmentFormSchema) as any,
    defaultValues: {
      clientFirstName: '',
      clientLastName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      clientCity: '',
      clientState: '',
      clientZipCode: '',
      businessId,
      clientId: undefined,
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
  const clientFirstNameValue = form.watch('clientFirstName'); // Watch the first name field for CommandInput

  useEffect(() => {
    if (!selectedClientId) {
      setVehicles([]);
      form.setValue('vehicleId', '');
      return;
    }
    startVehicleTransition(async () => {
      form.setValue('vehicleId', '');
      const fetchedVehicles =
        await getVehiclesForClientAction(selectedClientId);
      setVehicles(fetchedVehicles);
    });
  }, [selectedClientId, form]);

  const handleClientSelect = (clientId: string, clientName: string) => {
    startClientFetchTransition(async () => {
      const clientDetails = await getClientDetailsAction(clientId);
      if (clientDetails) {
        const { address, city, state, zipCode } = parseFullAddress(
          clientDetails.address
        );
        const { firstName, lastName } = parseClientName(clientDetails.name);

        form.reset({
          ...form.getValues(),
          clientId: clientDetails.id,
          clientFirstName: firstName,
          clientLastName: lastName,
          clientEmail: clientDetails.email || '',
          clientPhone: clientDetails.phone || '',
          clientAddress: address,
          clientCity: city,
          clientState: state,
          clientZipCode: zipCode,
        });
      } else {
        toast.error('Could not fetch client details.');
      }
      setIsComboboxOpen(false);
    });
  };

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
        form.setValue('clientAddress', `${street_number} ${route}`.trim(), {
          shouldValidate: true,
        });
        form.setValue('clientCity', get('locality'), { shouldValidate: true });
        form.setValue('clientState', get('administrative_area_level_1'), {
          shouldValidate: true,
        });
        form.setValue('clientZipCode', get('postal_code'), {
          shouldValidate: true,
        });
      }
    }
  };

  const onSubmit = (data: NewAppointmentFormValues) => {
    console.log('Form Data Submitted:', data);
    toast.info('Submit functionality is ready.', {
      description: 'The form can now be submitted to the server action.',
    });
    formAction(data);
  };

  const googleMapsApiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;
  if (!googleMapsApiKey) {
    return <div>Error: Google Maps API key is not configured.</div>;
  }

  // Filter clients based on the current input value for CommandInput
  const filteredClients = clientFirstNameValue
    ? clients.filter(client =>
        client.name.toLowerCase().includes(clientFirstNameValue.toLowerCase())
      )
    : clients;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4 relative'>
            {isFetchingClient && (
              <div className='absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-lg'>
                <Loader2 className='h-8 w-8 animate-spin' />
              </div>
            )}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                name='clientFirstName'
                control={form.control}
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>First Name *</FormLabel>
                    <Popover
                      open={isComboboxOpen}
                      onOpenChange={setIsComboboxOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          {/* We render a dummy input here to maintain the layout and label positioning */}
                          {/* The actual input for typing will be inside the CommandInput */}
                          <Input
                            ref={inputRef} // Attach the ref to this input to measure its dimensions
                            placeholder='Search or type first name...'
                            value={field.value} // Keep its value in sync
                            onChange={field.onChange} // Keep its onChange in sync
                            className={cn(
                              'w-full', // Ensure it takes full width of its container
                              isComboboxOpen && 'opacity-0 absolute -z-10' // Hide it when combobox is open, but keep its space
                            )}
                          />
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className='p-0'
                        style={{
                          width: inputRef.current
                            ? inputRef.current.offsetWidth
                            : 'auto', // Match width of the hidden input
                          left: inputRef.current
                            ? inputRef.current.offsetLeft
                            : 'auto', // Match left position
                          top: inputRef.current
                            ? inputRef.current.offsetTop +
                              inputRef.current.offsetHeight +
                              8 // Position below the input, adjust 8px for spacing
                            : 'auto',
                        }}
                        onCloseAutoFocus={e => e.preventDefault()} // Prevent focus jump
                      >
                        <Command>
                          <CommandInput
                            placeholder='Search or type first name...'
                            value={field.value}
                            onValueChange={value => {
                              field.onChange(value);
                              if (!isComboboxOpen) {
                                setIsComboboxOpen(true);
                              }
                              if (selectedClientId) {
                                form.reset({
                                  ...form.getValues(),
                                  clientId: undefined,
                                  clientLastName: '',
                                  clientEmail: '',
                                  clientPhone: '',
                                  clientAddress: '',
                                  clientCity: '',
                                  clientState: '',
                                  clientZipCode: '',
                                });
                              }
                            }}
                            autoFocus // Focus the CommandInput when popover opens
                          />
                          <CommandList>
                            <CommandEmpty>
                              No client found. Continue typing to create.
                            </CommandEmpty>
                            <CommandGroup>
                              {filteredClients.map(client => (
                                <CommandItem
                                  value={client.name}
                                  key={client.id}
                                  onSelect={() =>
                                    handleClientSelect(client.id, client.name)
                                  }
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      client.id === selectedClientId
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  {client.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name='clientLastName'
                control={form.control}
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
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                name='clientEmail'
                control={form.control}
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
                name='clientPhone'
                control={form.control}
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

            <LoadScript
              googleMapsApiKey={googleMapsApiKey}
              libraries={libraries}
            >
              <FormField
                name='clientAddress'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Autocomplete
                        onLoad={onLoad}
                        onPlaceChanged={onPlaceChanged}
                      >
                        <Input
                          placeholder='Start typing an address...'
                          {...field}
                        />
                      </Autocomplete>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </LoadScript>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <FormField
                name='clientCity'
                control={form.control}
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
                name='clientState'
                control={form.control}
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
                name='clientZipCode'
                control={form.control}
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
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
                            !selectedClientId
                              ? 'Select a client first'
                              : isVehiclesLoading
                                ? 'Loading vehicles...'
                                : 'Select a vehicle'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicles.map(vehicle => (
                        <SelectItem key={vehicle.value} value={vehicle.value}>
                          {vehicle.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                        <Input {...field} placeholder='Service or Item Name' />
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
          <Button type='submit' disabled={isPending || isFetchingClient}>
            {(isPending || isFetchingClient) && (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            )}
            Create Appointment
          </Button>
        </div>
      </form>
    </Form>
  );
}
