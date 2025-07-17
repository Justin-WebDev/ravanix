import prisma from '@/lib/prisma';
import { revalidateTag } from 'next/cache';
import { z } from 'zod/v4';

const vehicleSchema = z.object({
  clientId: z.cuid(),
  year: z.coerce
    .number()
    .int()
    .gte(1900)
    .lte(new Date().getFullYear() + 2)
    .nullable(),
  make: z.string().min(1, 'Make is required.'),
  model: z.string().min(1, 'Model is required.'),
  color: z.string().nullable(),
  plate: z.string().nullable(),
  vin: z
    .string()
    .length(17, 'VIN must be 17 characters.')
    .or(z.literal(''))
    .nullable(),
  notes: z.string().nullable(),
});

const createVehicleHandler = async (data:any, userId:any) => {
  const { clientId, ...vehicleData } = data;
  // Verify user owns the client being added to
  const client = await prisma.client.findUnique({
    where: { id: clientId, userId },
  });
  if (!client) {
    return {
      success: false,
      message: 'Client not found or you do not have permission.',
    };
  }
  const newVehicle = await prisma.vehicle.create({
    data: { ...vehicleData, clientId },
  });
  revalidateTag(`client:${clientId}`);
  return {
    success: true,
    message: 'Vehicle added successfully.',
    vehicle: newVehicle,
  };
};

export const createVehicle = createSafeAction(
  vehicleSchema,
  createVehicleHandler
);

const updateVehicleSchema = vehicleSchema.partial().extend({ id: z.cuid() });

const updateVehicleHandler = async (data, userId) => {
  const { id, ...vehicleData } = data;
  const updatedVehicle = await prisma.vehicle.update({
    where: { id: id, client: { userId: userId } }, // Ensure user owns vehicle's client
    data: vehicleData,
  });
  revalidateTag(`client:${updatedVehicle.clientId}`);
  return {
    success: true,
    message: 'Vehicle updated successfully.',
    vehicle: updatedVehicle,
  };
};

export const updateVehicle = createSafeAction(
  updateVehicleSchema,
  updateVehicleHandler
);
