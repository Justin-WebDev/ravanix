// src/features/clients/actions.ts
'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';
import { executeSafeAction } from '@/lib/safe-action';
import { CreateClientSchema, ClientFormSchema } from './client.schemas';

const ActionInputSchema = z.intersection(
  CreateClientSchema as any,
  z.object({
    businessId: z.string(),
  })
);

export type CreateClientType = z.infer<typeof ActionInputSchema>;

export async function createClient(
  prevState: unknown,
  input: CreateClientType // Use the new input schema here
) {
  // Inside, we use the TRANSFORMING schema for validation
  return executeSafeAction(
    CreateClientSchema,
    input,
    async (validatedData, ctx) => {
      // validatedData is now the correctly transformed data with a `name` field
      const { businessId, name, email, phone, address, vehicles } =
        validatedData;

      const newClient = await prisma.client.create({
        data: {
          name,
          email,
          phone,
          address,
          business: {
            connect: { id: businessId },
          },
          vehicles: {
            create: vehicles,
          },
        },
      });

      revalidateTag('clients');

      return {
        data: {
          message: `Successfully created client: ${name}`,
          clientId: newClient.id,
        },
      };
    }
  );
}
