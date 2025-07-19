// src/features/appointments/actions.ts
'use server';

import { z } from 'zod/v4';
import { revalidateTag } from 'next/cache';
import prisma from '@/lib/prisma';
import { executeSafeAction } from '@/lib/safe-action';
import { CreateAppointmentSchema } from './appointment.schemas';

type ActionInput = z.infer<typeof CreateAppointmentSchema>;

// This is now a standard server action that accepts the form input.
export async function createAppointment(
  prevState: unknown,
  input: ActionInput
) {
  // We call executeSafeAction INSIDE the action, providing the schema, input, and the handler logic.
  return executeSafeAction(
    CreateAppointmentSchema,
    input,
    async (validatedData, ctx) => {
      const { items, ...appointmentData } = validatedData;

      try {
        const newAppointment = await prisma.appointment.create({
          data: {
            ...appointmentData,
            items: {
              create: items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                serviceId: item.serviceId,
              })),
            },
          },
        });

        // Revalidate the cache for appointments so the calendar updates.
        revalidateTag('appointments');

        return {
          data: {
            message: 'Successfully created appointment.',
            appointmentId: newAppointment.id,
          },
        };
      } catch (error) {
        console.error('Failed to create appointment:', error);
        return {
          serverError: 'Failed to create appointment. Please try again.',
        };
      }
    }
  );
}
