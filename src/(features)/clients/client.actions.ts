// src/features/clients/actions.ts
'use server';

import { z } from 'zod/v4';
import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';
import { executeSafeAction } from '@/lib/safe-action';
import { CreateClientSchema, ClientFormSchema } from './client.schemas';
import { auth } from '@clerk/nextjs/server';
import { getClientDetails } from './client.queries';

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

export async function getClientDetailsAction(clientId: string | null) {
  if (!clientId) {
    return null;
  }

  const { userId } = await auth();
  if (!userId) {
    // This should ideally not happen if the page is protected, but it's a good safeguard.
    return null;
  }

  try {
    const clientDetails = await getClientDetails(clientId, userId);
    return clientDetails;
  } catch (error) {
    console.error('Failed to fetch client details:', error);
    // Return null or throw a more specific error depending on how you want to handle this on the client
    return null;
  }
}
