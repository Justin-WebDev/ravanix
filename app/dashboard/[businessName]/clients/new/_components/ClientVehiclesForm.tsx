// app/dashboard/[businessName]/clients/new/_components/ClientVehiclesForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car } from 'lucide-react';
import { VehicleForm } from './VehicleForm';

type SelectOption = { value: string; label: string };

export function ClientVehiclesForm() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'vehicles',
  });

  const watchedVehicles = useWatch({ control, name: 'vehicles' });

  const [makes, setMakes] = useState<SelectOption[]>([]);
  const [modelsByRow, setModelsByRow] = useState<
    Record<number, SelectOption[]>
  >({});
  const [isLoadingMakes, setIsLoadingMakes] = useState(false);
  const [loadingModelsForRow, setLoadingModelsForRow] = useState<
    Record<number, boolean>
  >({});

  // useEffect(() => {
  //   const fetchMakes = async () => {
  //     setIsLoadingMakes(true);
  //     setMakes([]);
  //     try {
  //       const response = await fetch(
  //         `https://api.nhtsa.gov/SafetyRatings/modelyear/${0}?format=json`
  //       );
  //       if (!response.ok) throw new Error('Failed to fetch makes list');
  //       const data = await response.json();
  //       setMakes(data || []);
  //     } catch (error) {
  //       toast.error('Error Loading Makes', {
  //         description: (error as Error).message,
  //       });
  //       setMakes([]);
  //     } finally {
  //       setIsLoadingMakes(false);
  //     }
  //   };
  //   fetchMakes();
  // }, []);

  // THIS IS THE FIX: We use JSON.stringify to create a stable dependency
  const stableWatchedVehicles = JSON.stringify(watchedVehicles);

  useEffect(() => {
    const vehicles = JSON.parse(stableWatchedVehicles);

    vehicles.forEach((vehicle: any, index: number) => {
      const { year, make } = vehicle;
      if (year && make) {
        const fetchModels = async () => {
          setLoadingModelsForRow(prev => ({ ...prev, [index]: true }));
          try {
            const response = await fetch(
              `/api/vehicle-data/models?year=${year}&makeName=${encodeURIComponent(make)}`
            );
            if (!response.ok)
              throw new Error(`Failed to fetch models for ${make}`);
            const data = await response.json();
            setModelsByRow(prev => ({ ...prev, [index]: data || [] }));
          } catch (error) {
            toast.error('Error Loading Models', {
              description: (error as Error).message,
            });
          } finally {
            setLoadingModelsForRow(prev => ({ ...prev, [index]: false }));
          }
        };

        // Only fetch if we don't have models for this combination yet
        const currentModels = modelsByRow[index];
        if (!currentModels || currentModels.length === 0) {
          fetchModels();
        }
      }
    });
    // The dependency array now uses the stable string
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
