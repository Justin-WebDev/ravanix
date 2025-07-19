// src/features/clients/queries.ts
import prisma from '@/lib/prisma';
import { unstable_cache as cache } from 'next/cache';
import { type ClientData } from './client.types';
// We no longer need to import auth or redirect here

export const getClientsForBusiness = cache(
  // The function now accepts userId as a parameter
  async (
    businessName: string,
    userId: string | null
  ): Promise<ClientData[]> => {
    // We check the userId that was passed in.
    if (!userId) {
      return [];
    }

    const business = await prisma.business.findFirst({
      where: {
        name: decodeURIComponent(businessName),
        // This authorization check is now based on the passed-in userId
        OR: [{ ownerId: userId }, { employees: { some: { clerkId: userId } } }],
      },
      select: { id: true },
    });

    if (!business) {
      return [];
    }

    const clients = await prisma.client.findMany({
      where: {
        businessId: business.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return clients;
  },
  ['clients'], // The base cache key
  {
    tags: ['clients'],
  }
);

// --- NEW QUERY FOR CLIENT SELECTION ---
export type ClientForSelect = {
  id: string;
  name: string;
};
/**
 * Fetches a simplified list of clients for a given business,
 * intended for use in select/dropdown components.
 */
export const getClientsForSelect = cache(
  async (businessId: string | null): Promise<ClientForSelect[]> => {
    if (!businessId) {
      return [];
    }

    const clients = await prisma.client.findMany({
      where: {
        businessId: businessId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return clients;
  },
  ['clients-for-select'], // A unique cache key for this specific query
  {
    tags: ['clients'], // Tagged so it revalidates when a new client is created
  }
);
