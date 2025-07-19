// src/features/vehicles/actions.ts
'use server';

import { z } from 'zod/v4';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidateTag } from 'next/cache';
import { executeSafeAction } from '@/lib/safe-action';
import { UpsertVehicleSchema } from './vehicle.schemas';
import {
  getVehicleMakes,
  getVehicleModels,
  getVehiclesForClient,
} from './vehicle.queries';

type UpsertVehicleInput = z.infer<typeof UpsertVehicleSchema>;

export async function upsertVehicle(
  prevState: unknown,
  input: UpsertVehicleInput
) {
  return executeSafeAction(
    UpsertVehicleSchema,
    input,
    async (validatedData, { userId }) => {
      const { id, clientId, ...vehicleData } = validatedData;

      // Authorization check: Ensure the user has access to this client.
      const client = await prisma.client.findFirst({
        where: {
          id: clientId,
          business: {
            OR: [
              { ownerId: userId },
              { employees: { some: { clerkId: userId } } },
            ],
          },
        },
      });

      if (!client) {
        return {
          serverError: 'Client not found or you do not have permission.',
        };
      }

      try {
        if (id) {
          // --- UPDATE LOGIC ---
          const updatedVehicle = await prisma.vehicle.update({
            where: { id: id, clientId: clientId }, // Ensure vehicle belongs to the correct client
            data: vehicleData,
          });

          revalidateTag(`clients`);
          revalidateTag('appointments');

          return {
            data: {
              message: 'Vehicle updated successfully.',
              vehicle: updatedVehicle,
            },
          };
        } else {
          // --- CREATE LOGIC ---
          const newVehicle = await prisma.vehicle.create({
            data: {
              ...vehicleData,
              clientId,
            },
          });

          revalidateTag(`clients`);
          revalidateTag('appointments');

          return {
            data: {
              message: 'Vehicle added successfully.',
              vehicle: newVehicle,
            },
          };
        }
      } catch (error) {
        console.error('Upsert vehicle failed:', error);
        return {
          serverError: `Failed to ${id ? 'update' : 'create'} vehicle.`,
        };
      }
    }
  );
}

export async function getMakesAction(year: number) {
  return getVehicleMakes(year);
}

export async function getModelsAction(year: number, make: string) {
  return getVehicleModels(year, make);
}

export async function getVehiclesForClientAction(clientId: string | null) {
  const { userId } = await auth();
  return getVehiclesForClient(clientId, userId);
}
