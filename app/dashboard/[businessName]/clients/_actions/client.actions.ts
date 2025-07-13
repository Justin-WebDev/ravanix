'use server';

import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { CreateClientSchema } from './client.schemas';

export type CreateClientFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export async function createClient(
  // businessId: string, // We need to know which business to add the client to
  prevState: CreateClientFormState,
  formData: FormData
): Promise<CreateClientFormState> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, message: 'You must be signed in.' };
  }

  const businessId = formData.get('businessId') as string;
  if (!businessId) {
    return { success: false, message: 'Business ID is missing.' };
  }

  const jsonString = formData.get('jsonData') as string;
  const data = JSON.parse(jsonString);

  const validatedFields = CreateClientSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the fields.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, phone, address, notes, vehicles } = validatedFields.data;

  try {
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

    // Revalidate the clients page to show the new client
    revalidatePath(`/dashboard/${businessId}/clients`);
    return { success: true, message: `Successfully created client: ${name}` };
  } catch (error) {
    console.error('Failed to create client:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
