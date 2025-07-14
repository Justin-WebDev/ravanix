// app/dashboard/[businessName]/clients/new/_components/ClientVehiclesForm.tsx
'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormMessage } from '@/components/ui/form';
import { Car, Plus } from 'lucide-react';
// Import our new components
import { VehicleDisplayCard, VehicleForm } from './VehicleForm';

export function ClientVehiclesForm() {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'vehicles',
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddNewVehicle = () => {
    const newVehicleIndex = fields.length;
    append({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      plate: '',
      vin: '',
      notes: '',
    });
    setEditingIndex(newVehicleIndex);
  };

  const handleSaveVehicle = () => {
    setEditingIndex(null);
  };

  const handleRemoveVehicle = (index: number) => {
    remove(index);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle className='flex items-center gap-3 text-lg'>
          <Car className='w-5 h-5 text-primary' /> Vehicles
        </CardTitle>
        <Button
          type='button'
          variant='default'
          size='sm'
          onClick={handleAddNewVehicle}
          disabled={editingIndex !== null}
        >
          <Plus className='mr-2 h-4 w-4' />
          Add Vehicle
        </Button>
      </CardHeader>
      <CardContent className='space-y-4'>
        {fields.length > 0 ? (
          fields.map((field, index) => (
            <div key={field.id}>
              {editingIndex === index ? (
                <VehicleForm index={index} onSave={handleSaveVehicle} />
              ) : (
                <VehicleDisplayCard
                  index={index}
                  onEdit={() => setEditingIndex(index)}
                  onRemove={() => handleRemoveVehicle(index)}
                />
              )}
            </div>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center text-center py-10 border-2 border-dashed rounded-lg'>
            <p className='text-muted-foreground'>No vehicles added yet.</p>
            <p className='text-sm text-muted-foreground mt-1'>
              Click "+ Add Vehicle" to get started.
            </p>
          </div>
        )}
        <FormMessage>
          {errors.vehicles?.message || (errors.vehicles as any)?.root?.message}
        </FormMessage>
      </CardContent>
    </Card>
  );
}
