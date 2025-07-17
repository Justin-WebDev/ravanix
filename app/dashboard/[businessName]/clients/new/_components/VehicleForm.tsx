// app/dashboard/[businessName]/clients/new/_components/VehicleForm.tsx
'use client';

import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Trash2, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

type SelectOption = { value: string; label: string };

const generateYearOptions = (): SelectOption[] => {
  const endYear = new Date().getFullYear() + 1;
  const startYear = 1950;
  const years: SelectOption[] = [];
  for (let i = endYear; i >= startYear; i--) {
    years.push({ value: i.toString(), label: i.toString() });
  }
  return years;
};

type VehicleFormProps = {
  index: number;
  remove: (index: number) => void;
  canRemove: boolean;
  makes: SelectOption[];
  models: SelectOption[];
  isLoadingMakes: boolean;
  isLoadingModels: boolean;
};

export function VehicleForm({
  index,
  remove,
  canRemove,
  makes,
  models,
  isLoadingMakes,
  isLoadingModels,
}: VehicleFormProps) {
  const { control, setValue } = useFormContext();
  const [yearOptions] = useState<SelectOption[]>(generateYearOptions());

  const [isYearComboboxOpen, setIsYearComboboxOpen] = useState(false);
  const [isMakeComboboxOpen, setIsMakeComboboxOpen] = useState(false);
  const [isModelComboboxOpen, setIsModelComboboxOpen] = useState(false);

  const yearValue = useWatch({ control, name: `vehicles.${index}.year` });
  const makeValue = useWatch({ control, name: `vehicles.${index}.make` });

  return (
    <div className='p-4 border rounded-lg space-y-4 relative'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <FormField
          control={control}
          name={`vehicles.${index}.year`}
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Year *</FormLabel>
              <Popover
                open={isYearComboboxOpen}
                onOpenChange={setIsYearComboboxOpen}
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant='outline'
                      role='combobox'
                      className={cn(
                        'justify-between',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value || 'Select Year'}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-[200px] p-0'>
                  <Command>
                    <CommandInput placeholder='Search year...' />
                    <CommandList>
                      <CommandEmpty>No year found.</CommandEmpty>
                      <CommandGroup>
                        {yearOptions.map(option => (
                          <CommandItem
                            value={option.label}
                            key={option.value}
                            onSelect={() => {
                              setValue(
                                `vehicles.${index}.year`,
                                Number(option.value),
                                { shouldValidate: true }
                              );
                              setValue(`vehicles.${index}.make`, '', {
                                shouldValidate: true,
                              });
                              setValue(`vehicles.${index}.model`, '', {
                                shouldValidate: true,
                              });
                              setIsYearComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                Number(option.value) === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {option.label}
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
          control={control}
          name={`vehicles.${index}.make`}
          render={({ field }) => (
            <FormItem className='flex flex-col'>
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
                      disabled={isLoadingMakes || !yearValue}
                      className={cn(
                        'justify-between w-full',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {isLoadingMakes ? (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      ) : (
                        field.value || 'Select Make'
                      )}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-[200px] p-0'>
                  <Command>
                    <CommandInput placeholder='Search make...' />
                    <CommandList>
                      <CommandEmpty>No make found.</CommandEmpty>
                      <CommandGroup>
                        {makes.map(option => (
                          <CommandItem
                            value={option.label}
                            key={option.value}
                            onSelect={() => {
                              setValue(`vehicles.${index}.make`, option.value, {
                                shouldValidate: true,
                              });
                              setValue(`vehicles.${index}.model`, '', {
                                shouldValidate: true,
                              });
                              setIsMakeComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                option.value === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {option.label}
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
          control={control}
          name={`vehicles.${index}.model`}
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Model *</FormLabel>
              <Popover
                open={isModelComboboxOpen}
                onOpenChange={setIsModelComboboxOpen}
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant='outline'
                      role='combobox'
                      disabled={isLoadingModels || !makeValue}
                      className={cn(
                        'justify-between w-full',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {isLoadingModels ? (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      ) : (
                        field.value || 'Select Model'
                      )}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-[200px] p-0'>
                  <Command>
                    <CommandInput placeholder='Search model...' />
                    <CommandList>
                      <CommandEmpty>No model found.</CommandEmpty>
                      <CommandGroup>
                        {models.map(option => (
                          <CommandItem
                            value={option.label}
                            key={option.value}
                            onSelect={() => {
                              setValue(
                                `vehicles.${index}.model`,
                                option.value,
                                { shouldValidate: true }
                              );
                              setIsModelComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                option.value === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {option.label}
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
          control={control}
          name={`vehicles.${index}.color`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`vehicles.${index}.plate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>License Plate</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`vehicles.${index}.vin`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>VIN</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`vehicles.${index}.notes`}
          render={({ field }) => (
            <FormItem className='md:col-span-3'>
              <FormLabel>Vehicle Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      {canRemove && (
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
  );
}
