// app/dashboard/[businessName]/clients/new/_components/VehicleForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
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
import { ChevronsUpDown, Check, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// --- Helper Functions ---
const generateYearOptions = () => {
  const endYear = new Date().getFullYear() + 1;
  const startYear = 1950;
  let years = [];
  for (let i = endYear; i >= startYear; i--) {
    years.push({ value: i.toString(), label: i.toString() });
  }
  return years;
};

// --- Sub-Components ---

export function VehicleDisplayCard({
  index,
  onEdit,
  onRemove,
}: {
  index: number;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { watch } = useFormContext();
  const vehicle = watch(`vehicles.${index}`);
  const vehicleName = [vehicle.year, vehicle.make, vehicle.model]
    .filter(Boolean)
    .join(' ');
  const vehicleDetails = [
    vehicle.color ? `Color: ${vehicle.color}` : null,
    vehicle.plate ? `Plate: ${vehicle.plate}` : null,
  ]
    .filter(Boolean)
    .join(' ・ ');
  return (
    <div className='flex items-center justify-between p-4 border rounded-lg bg-card'>
      <div>
        <p className='font-semibold'>{vehicleName || 'New Vehicle'}</p>
        {vehicleDetails && (
          <p className='text-sm text-muted-foreground'>{vehicleDetails}</p>
        )}
      </div>
      <div className='flex items-center gap-2'>
        <Button type='button' variant='ghost' size='icon' onClick={onEdit}>
          <Edit className='w-4 h-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='text-muted-foreground hover:text-destructive'
          onClick={onRemove}
        >
          <Trash2 className='w-4 h-4' />
        </Button>
      </div>
    </div>
  );
}

export function VehicleForm({
  index,
  onSave,
}: {
  index: number;
  onSave: () => void;
}) {
  const form = useFormContext();
  const [yearOptions] = useState(generateYearOptions());
  const [makes, setMakes] = useState<{ value: string; label: string }[]>([]);
  const [models, setModels] = useState<{ value: string; label: string }[]>([]);
  const [isLoadingMakes, setIsLoadingMakes] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isMakeComboboxOpen, setIsMakeComboboxOpen] = useState(false);

  const selectedYear = form.watch(`vehicles.${index}.year`);
  const selectedMake = form.watch(`vehicles.${index}.make`);

  useEffect(() => {
    const fetchMakes = async () => {
      setIsLoadingMakes(true);
      try {
        const response = await fetch('/api/vehicle-data/makes');
        if (!response.ok) throw new Error('Failed to fetch makes list');
        const data = await response.json();
        setMakes(data || []);
      } catch (error) {
        toast.error('Error Loading Makes', {
          description: (error as Error).message,
        });
        setMakes([]);
      } finally {
        setIsLoadingMakes(false);
      }
    };
    fetchMakes();
  }, []);

  useEffect(() => {
    if (selectedYear && selectedMake) {
      const fetchModels = async () => {
        setIsLoadingModels(true);
        setModels([]);
        try {
          const response = await fetch(
            `/api/vehicle-data/models?year=${selectedYear}&makeName=${encodeURIComponent(selectedMake)}`
          );
          if (!response.ok)
            throw new Error(
              'Failed to fetch models for the selected make/year'
            );
          const data = await response.json();
          setModels(data || []);
        } catch (error) {
          toast.error('Error Loading Models', {
            description: (error as Error).message,
          });
          setModels([]);
        } finally {
          setIsLoadingModels(false);
        }
      };
      fetchModels();
    } else {
      setModels([]);
    }
  }, [selectedYear, selectedMake]);

  return (
    <div className='p-4 border rounded-lg space-y-4 relative bg-background/50'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <FormField
          control={form.control}
          name={`vehicles.${index}.year`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year *</FormLabel>
              <Select
                onValueChange={value => {
                  field.onChange(Number(value));
                  form.setValue(`vehicles.${index}.make`, '');
                  form.setValue(`vehicles.${index}.model`, '');
                }}
                value={String(field.value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select Year' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent position='popper'>
                  {yearOptions.map(y => (
                    <SelectItem key={y.value} value={y.value}>
                      {y.label}
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
          name={`vehicles.${index}.make`}
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
                      className={cn(
                        'w-full justify-between font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                      disabled={isLoadingMakes || !selectedYear}
                    >
                      {field.value
                        ? makes.find(m => m.value === field.value)?.label
                        : isLoadingMakes
                          ? 'Loading...'
                          : 'Select Make'}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  // position='popper'
                  className='w-[--radix-popover-trigger-width] p-0'
                >
                  <Command>
                    <CommandInput placeholder='Search make...' />
                    <CommandList>
                      <CommandEmpty>No make found.</CommandEmpty>
                      <CommandGroup>
                        {makes.map(m => (
                          <CommandItem
                            value={m.label}
                            key={m.value}
                            onSelect={() => {
                              form.setValue(`vehicles.${index}.make`, m.value);
                              form.setValue(`vehicles.${index}.model`, '');
                              setIsMakeComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                m.value === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {m.label}
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
          control={form.control}
          name={`vehicles.${index}.model`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingModels ? 'Loading...' : 'Select Model'
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent position='popper'>
                  {models.map(m => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
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
                <Input {...field} maxLength={17} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className='flex justify-end'>
        <Button type='button' onClick={onSave}>
          Save Vehicle
        </Button>
      </div>
    </div>
  );
}
