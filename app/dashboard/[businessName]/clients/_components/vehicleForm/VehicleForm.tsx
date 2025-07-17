import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronsUpDown, Command, Loader2 } from 'lucide-react';
import { useActionState, useEffect, useState, useTransition } from 'react';
import { Form, useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import {
  createVehicle,
  updateVehicle,
} from '../../_actions/client.vehicle.actions';
import { toast } from 'sonner';
import {
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
} from '@radix-ui/react-select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';
import { CommandInput, CommandList } from 'cmdk';
import { CommandEmpty, CommandGroup } from '@/components/ui/command';
import { VehicleFormSchema } from './client.vehicle.schema';
import { fetchVehicleMakes } from '@/lib/data-access-layer/vehicle-data/makes';

export function VehicleForm({
  clientId,
  vehicleData = {
    year: null,
    make: null,
    model: null,
    color: '',
    licensePlate: '',
    vin: '',
    notes: '',
  },
  isEditing = false,
  onSuccess,
  onCancel,
}) {
  // const [isPending, startTransition] = useTransition();
  const yearOptions = generateYearOptions();
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  // const [isLoadingMakes, setIsLoadingMakes] = useState(false);
  // const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isMakeComboboxOpen, setIsMakeComboboxOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(VehicleFormSchema),
    defaultValues: prepareVehicleInitialData(vehicleData),
    mode: 'onSubmit',
  });

  const selectedYear = form.watch('year');
  const selectedMake = form.watch('make');

  const action = isEditing ? updateVehicle : createVehicle;
  const [formState, formAction, isPending] = useActionState(action, {
    success: false,
    message: null,
    errors: null,
    vehicle: null,
  });

  useEffect(() => {
    if (!!selectedYear) {
      const fetchedMakes = async () => {
        const fetchedMakes = await fetchVehicleMakes(parseInt(selectedYear));
        setMakes(fetchedMakes || []);
      };
    }

    // const fetchMakes = async () => {
    //   // setMakes([]);
    //   try {
    //     const response = await fetch(
    //       `https://api.nhtsa.gov/SafetyRatings/modelyear/${1951}?format=json`
    //     );
    //     console.log(response);
    //     if (!response.ok) throw new Error('Failed to fetch makes list');
    //     const data = await response.json();
    //     setMakes(data || []);
    //   } catch (error: any) {
    //     toast.error('Error Loading Makes', { description: error.message });
    //     setMakes([]);
    //   }
    // };
    // fetchMakes();
  }, [selectedYear]);

  useEffect(() => {
    if (selectedYear && selectedMake) {
      const fetchModels = async () => {
        // setIsLoadingModels(true);
        // setModels([]);
        try {
          const response = await fetch(
            `/api/vehicle-data/models?year=${selectedYear}&makeName=${encodeURIComponent(
              selectedMake
            )}`
          );
          if (!response.ok)
            throw new Error(
              'Failed to fetch models for the selected make/year'
            );
          const data = await response.json();
          if (!!data) setModels(data);
        } catch (error: any) {
          toast.error('Error Loading Models', { description: error.message });
          setModels([]);
        }
      };
      fetchModels();
    } else {
      if (models.length > 0) setModels([]);
    }
  }, [selectedYear, selectedMake]);

  // useEffect(() => {
  //   if (isEditing && vehicleData) {
  //     form.reset(prepareVehicleInitialData(vehicleData));
  //   } else if (!isEditing) {
  //     form.reset(prepareVehicleInitialData({}));
  //   }
  // }, [vehicleData, isEditing]);

  //

  const handleVehicleSubmit = data => {
    // startTransition(() => {
    const formData = new FormData();
    formData.append('clientId', clientId);
    if (isEditing) formData.append('id', vehicleData.id);

    formData.append('year', data.year || '');
    formData.append('make', data.make || '');
    formData.append('model', data.model || '');
    formData.append('color', data.color || '');
    formData.append('plate', data.licensePlate || '');
    formData.append('vin', data.vin || '');
    formData.append('notes', data.notes || '');
    formAction(formData);
    // });
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleVehicleSubmit)}
        className='space-y-4 pt-2'
      >
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='year'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year *</FormLabel>
                <Select
                  onValueChange={value => {
                    field.onChange(value);
                    form.setValue('make', null, {
                      shouldValidate: false,
                      shouldDirty: true,
                    });
                    form.setValue('model', null, {
                      shouldValidate: false,
                      shouldDirty: true,
                    });
                    setModels([]);
                  }}
                  value={field.value || ''}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select Year' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {yearOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='make'
            render={({ field }) => (
              <FormItem className='flex flex-col justify-end'>
                <FormLabel>Make *</FormLabel>
                <Popover
                  open={isMakeComboboxOpen}
                  onOpenChange={setIsMakeComboboxOpen}
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant='outline'
                        role='combobox'
                        aria-expanded={isMakeComboboxOpen}
                        className={cn(
                          'w-full justify-between font-normal min-h-[2.5rem] h-10 py-2 px-3 text-left',
                          !field.value && 'text-muted-foreground'
                        )}
                        disabled={isPending || isLoadingMakes || !selectedYear}
                      >
                        {field.value
                          ? makes.find(make => make.value === field.value)
                              ?.label
                          : isLoadingMakes
                            ? 'Loading makes...'
                            : 'Select Make'}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0'>
                    <Command
                      filter={(value, search) =>
                        value.toLowerCase().includes(search.toLowerCase())
                          ? 1
                          : 0
                      }
                    >
                      <CommandInput
                        placeholder='Search make...'
                        disabled={isLoadingMakes}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {isLoadingMakes
                            ? 'Loading...'
                            : makes.length === 0
                              ? 'No makes found.'
                              : 'No make found.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {makes.map(make => (
                            <CommandItem
                              value={make.label}
                              key={make.value}
                              onSelect={() => {
                                form.setValue('make', make.value, {
                                  shouldValidate: false,
                                  shouldDirty: true,
                                });
                                form.setValue('model', null, {
                                  shouldValidate: false,
                                  shouldDirty: true,
                                });
                                setModels([]);
                                setIsMakeComboboxOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  make.value === field.value
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {make.label}
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
        </div>
        <FormField
          control={form.control}
          name='model'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model *</FormLabel>
              <Select
                onValueChange={value => field.onChange(value)}
                value={field.value || ''}
                disabled={
                  isPending || isLoadingModels || !selectedMake || !selectedYear
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingModels ? 'Loading models...' : 'Select Model'
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {models.length === 0 &&
                    selectedMake &&
                    selectedYear &&
                    !isLoadingModels && (
                      <SelectItem value='-' disabled>
                        No models found for selected make/year
                      </SelectItem>
                    )}
                  {models.map(model => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='color'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <Input
                  placeholder='e.g., Blue'
                  {...field}
                  value={field.value || ''}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='licensePlate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  License Plate{' '}
                  <span className='text-xs text-muted-foreground'>
                    (Optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='e.g., ABC-123'
                    {...field}
                    value={field.value || ''}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='vin'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  VIN{' '}
                  <span className='text-xs text-muted-foreground'>
                    (Optional, 17 chars)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='17-character VIN'
                    {...field}
                    value={field.value || ''}
                    disabled={isPending}
                    maxLength={17}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name='notes'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Vehicle Notes{' '}
                <span className='text-xs text-muted-foreground'>
                  (Optional)
                </span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder='e.g., Specific trim, aftermarket parts, known issues...'
                  {...field}
                  value={field.value || ''}
                  rows={3}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className='pt-4'>
          {onCancel && (
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
          )}
          <SubmitButton
            isEditing={isEditing}
            disabled={isLoadingMakes || isLoadingModels}
          />
        </DialogFooter>
      </form>
    </Form>
  );
}
