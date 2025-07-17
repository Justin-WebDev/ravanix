// app/dashboard/[businessName]/clients/_actions/client.actions.ts
'use server';

import { z } from 'zod/v4';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { executeSafeAction } from '@/lib/safe-action';
import { CreateClientSchema } from './client.schemas';

// Define the full input schema for the action by extending the base form schema
// to include the businessId that we'll pass in.
const ActionInputSchema = z.intersection(
  CreateClientSchema,
  z.object({
    businessId: z.string(),
  })
);

// This is now a standard async function, which satisfies the "use server" constraint.
export async function createClient(
  prevState: unknown, // Required for useActionState, but we won't use it.
  input: z.infer<typeof ActionInputSchema>
) {
  // We call our helper function to handle the logic.
  return executeSafeAction(
    ActionInputSchema,
    input,
    async (validatedData, ctx) => {
      const { businessId, name, email, phone, address, vehicles } =
        validatedData;

      await prisma.client.create({
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

      revalidatePath(`/dashboard/${businessId}/clients`);

      return { data: { message: `Successfully created client: ${name}` } };
    }
  );
}
