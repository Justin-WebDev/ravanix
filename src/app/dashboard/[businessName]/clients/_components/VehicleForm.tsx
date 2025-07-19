'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ChevronsUpDown, Check } from 'lucide-react';
import { z } from 'zod/v4';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { DialogFooter } from '@/components/ui/dialog';
import { SubmitButton } from '@/(features)/vehicles/_components/SubmitButton';

import { cn } from '@/lib/utils';
import {
  getMakesAction,
  getModelsAction,
  upsertVehicle,
} from '@/(features)/vehicles/vehicle.actions';
import { UpsertVehicleSchema } from '@/(features)/vehicles/vehicle.schemas';
import { type SelectOption } from '@/(features)/vehicles/vehicle.types';

const generateYearOptions = (): SelectOption[] => {
  const endYear = new Date().getFullYear() + 1;
  const startYear = 1950;
  const years: SelectOption[] = [];
  for (let i = endYear; i >= startYear; i--) {
    years.push({ value: i.toString(), label: i.toString() });
  }
  return years;
};

type UpsertVehicleFormValues = z.infer<typeof UpsertVehicleSchema>;

export function VehicleForm({
  clientId,
  vehicleData,
  isEditing = false,
  onSuccess,
  onCancel,
}: {
  clientId: string;
  vehicleData?: any;
  isEditing?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [makes, setMakes] = useState<SelectOption[]>([]);
  const [models, setModels] = useState<SelectOption[]>([]);
  const [isLoadingMakes, startMakesTransition] = useTransition();
  const [isLoadingModels, startModelsTransition] = useTransition();
  const [isMakeComboboxOpen, setIsMakeComboboxOpen] = useState(false);

  const yearOptions = generateYearOptions();

  const form = useForm<UpsertVehicleFormValues>({
    resolver: zodResolver(UpsertVehicleSchema) as any,
    defaultValues: {
      id: vehicleData?.id,
      year: vehicleData?.year ? vehicleData.year : new Date().getFullYear(),
      make: vehicleData?.make || '',
      model: vehicleData?.model || '',
      color: vehicleData?.color || '',
      plate: vehicleData?.plate || '',
      vin: vehicleData?.vin || '',
      notes: vehicleData?.notes || '',
      clientId: clientId,
    },
    mode: 'onSubmit',
  });

  const selectedYear = form.watch('year');
  const selectedMake = form.watch('make');

  const [formState, formAction, isPending] = useActionState(
    upsertVehicle,
    undefined
  );

  useEffect(() => {
    if (!formState) return;
    if (formState.data) {
      toast.success(formState.data.message);
      onSuccess?.();
    }
    if (formState.serverError) {
      toast.error(formState.serverError);
    }
  }, [formState, onSuccess]);

  useEffect(() => {
    if (!selectedYear) return;
    startMakesTransition(async () => {
      const fetchedMakes = await getMakesAction(selectedYear);
      setMakes(fetchedMakes);
    });
  }, [selectedYear]);

  useEffect(() => {
    if (!selectedYear || !selectedMake) {
      setModels([]);
      return;
    }
    startModelsTransition(async () => {
      setModels([]);
      const fetchedModels = await getModelsAction(selectedYear, selectedMake);
      setModels(fetchedModels);
    });
  }, [selectedYear, selectedMake]);

  const handleVehicleSubmit = (data: UpsertVehicleFormValues) => {
    formAction(data);
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
                    field.onChange(Number(value));
                    form.setValue('make', '', { shouldValidate: true });
                    form.setValue('model', '', { shouldValidate: true });
                  }}
                  defaultValue={String(field.value)}
                  disabled={isPending || isLoadingMakes}
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
                          'w-full justify-between font-normal',
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
                          {isLoadingMakes ? 'Loading...' : 'No make found.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {makes.map(make => (
                            <CommandItem
                              value={make.label}
                              key={make.value}
                              onSelect={() => {
                                form.setValue('make', make.value, {
                                  shouldValidate: true,
                                });
                                form.setValue('model', '', {
                                  shouldValidate: true,
                                });
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
                onValueChange={field.onChange}
                value={field.value ?? ''}
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
                  value={field.value ?? ''}
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
            name='plate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Plate</FormLabel>
                <FormControl>
                  <Input
                    placeholder='e.g., ABC-123'
                    {...field}
                    value={field.value ?? ''}
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
                <FormLabel>VIN</FormLabel>
                <FormControl>
                  <Input
                    placeholder='17-character VIN'
                    {...field}
                    value={field.value ?? ''}
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
              <FormLabel>Vehicle Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='e.g., Specific trim, aftermarket parts, known issues...'
                  {...field}
                  value={field.value ?? ''}
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
            pending={isPending}
            disabled={isLoadingMakes || isLoadingModels}
          />
        </DialogFooter>
      </form>
    </Form>
  );
}
