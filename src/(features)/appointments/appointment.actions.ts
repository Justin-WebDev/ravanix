// src/features/appointments/appointment.actions.ts
'use server';

import { z } from 'zod/v4';
import { revalidateTag } from 'next/cache';
import prisma from '@/lib/prisma';
import { executeSafeAction } from '@/lib/safe-action';
import {
  AppointmentFormSchema,
  type NewAppointmentFormValues,
} from './appointment.schemas';

export async function createAppointment(
  prevState: unknown,
  input: NewAppointmentFormValues
) {
  // 1. Use the base schema (without .transform) for validation.
  return executeSafeAction(
    AppointmentFormSchema,
    input,
    async (validatedData, ctx) => {
      // 2. Manually transform the validated data inside the handler.
      const {
        clientId,
        clientFirstName,
        clientLastName,
        clientEmail,
        clientPhone,
        clientAddress,
        clientCity,
        clientState,
        clientZipCode,
        ...appointmentData
      } = validatedData;

      const fullAddress = [
        clientAddress,
        clientCity,
        clientState,
        clientZipCode,
      ]
        .filter(Boolean)
        .join(', ');

      const clientDetails = {
        id: clientId,
        name: `${clientFirstName} ${clientLastName}`.trim(),
        email: clientEmail,
        phone: clientPhone,
        address: fullAddress,
      };

      const { items, ...restOfAppointmentData } = appointmentData;

      try {
        let client;

        // 3. Proceed with the "upsert" logic using the transformed data.
        if (clientDetails.id) {
          client = await prisma.client.findUnique({
            where: { id: clientDetails.id },
          });
          if (!client) {
            return { serverError: 'Selected client not found.' };
          }
        } else {
          client = await prisma.client.create({
            data: {
              name: clientDetails.name,
              email: clientDetails.email,
              phone: clientDetails.phone,
              address: clientDetails.address,
              businessId: appointmentData.businessId,
            },
          });
        }

        const newAppointment = await prisma.appointment.create({
          data: {
            ...restOfAppointmentData,
            clientId: client.id,
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

        revalidateTag('appointments');
        revalidateTag('clients');

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
