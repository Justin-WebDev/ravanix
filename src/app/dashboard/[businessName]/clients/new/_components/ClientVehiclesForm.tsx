// src/app/dashboard/[businessName]/clients/new/_components/ClientVehiclesForm.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car } from 'lucide-react';
import { VehicleForm } from './VehicleForm';

// --- NEW IMPORTS ---
import {
  getMakesAction,
  getModelsAction,
} from '@/(features)/vehicles/vehicle.actions';
import { type SelectOption } from '@/(features)/vehicles/vehicle.types';

export function ClientVehiclesForm() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'vehicles',
  });

  // Watch the entire array of vehicles for changes
  const watchedVehicles = useWatch({ control, name: 'vehicles' });
  const stableWatchedVehicles = JSON.stringify(watchedVehicles);

  // State for makes and models will now live in this parent component
  const [makes, setMakes] = useState<SelectOption[]>([]);
  const [modelsByRow, setModelsByRow] = useState<
    Record<number, SelectOption[]>
  >({});

  const [isLoadingMakes, startMakesTransition] = useTransition();
  const [loadingModelsForRow, setLoadingModelsForRow] = useState<
    Record<number, boolean>
  >({});

  // Fetch the general list of makes once when the component mounts.
  // We pass a recent year as a default; the NHTSA API for makes isn't year-specific.
  useEffect(() => {
    startMakesTransition(async () => {
      const fetchedMakes = await getMakesAction(new Date().getFullYear());
      setMakes(fetchedMakes);
    });
  }, []);

  // This effect now listens for changes in any vehicle's year or make
  useEffect(() => {
    const vehicles = JSON.parse(stableWatchedVehicles);

    vehicles.forEach((vehicle: any, index: number) => {
      const { year, make } = vehicle;

      // If a year and make are selected, fetch the models for that specific row
      if (year && make) {
        // Avoid re-fetching if we already have the models
        if (modelsByRow[index]) return;

        setLoadingModelsForRow(prev => ({ ...prev, [index]: true }));
        getModelsAction(year, make)
          .then(fetchedModels => {
            setModelsByRow(prev => ({ ...prev, [index]: fetchedModels }));
          })
          .catch(error => {
            toast.error('Error Loading Models', { description: error.message });
          })
          .finally(() => {
            setLoadingModelsForRow(prev => ({ ...prev, [index]: false }));
          });
      }
    });
  }, [stableWatchedVehicles, modelsByRow]);

  return (
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
          <VehicleForm
            key={field.id}
            index={index}
            remove={remove}
            canRemove={fields.length > 1}
            // Pass the fetched data down as props
            makes={makes}
            models={modelsByRow[index] || []}
            isLoadingMakes={isLoadingMakes}
            isLoadingModels={loadingModelsForRow[index] || false}
          />
        ))}
      </CardContent>
    </Card>
  );
}
