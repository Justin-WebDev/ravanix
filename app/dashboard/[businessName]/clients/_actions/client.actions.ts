// app/dashboard/[businessName]/clients/_actions/client.actions.ts
'use server';

import { z } from 'zod/v4';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createSafeAction } from '@/lib/safe-action';
import { CreateClientSchema } from './client.schemas';

// Define the full input schema for the action by extending the base form schema
// to include the businessId that we'll pass in.
const ActionInputSchema = z.intersection(
  CreateClientSchema,
  z.object({
    businessId: z.string(),
  })
);

export const createClient = createSafeAction(
  ActionInputSchema,

  // The handler now receives `validatedData` which is the result of
  // the Zod schema's `.transform()` function.
  async (validatedData, ctx) => {
    // We destructure the transformed data: `name` and `address` are now combined.
    const { businessId, name, email, phone, address, vehicles } = validatedData;

    await prisma.client.create({
      data: {
        name,
        email,
        phone,
        address, // This is now the combined address string or undefined
        business: {
          connect: { id: businessId },
        },
        vehicles: {
          create: vehicles,
        },
      },
    });

    revalidatePath(`/dashboard/${businessId}/clients`);

    return { data: { message: `Successfully created client: ${name}` } };
  }
);
