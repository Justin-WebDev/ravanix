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

// --- NEW TYPE AND QUERY FOR FETCHING CLIENT DETAILS ---

export type ClientDetails = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};

/**
 * Fetches the full details for a single client.
 * Includes an authorization check to ensure the user belongs to the
 * business that owns the client.
 */
export const getClientDetails = cache(
  async (
    clientId: string,
    userId: string | null
  ): Promise<ClientDetails | null> => {
    if (!clientId || !userId) {
      return null;
    }

    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        // Authorization check
        business: {
          OR: [
            { ownerId: userId },
            { employees: { some: { clerkId: userId } } },
          ],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
      },
    });

    if (!client) {
      return null;
    }

    // Here you could parse the full address into components if needed
    // For now, we'll return it as a single string.
    return client;
  },
  ['client-details'], // Cache key prefix
  {
    // Tagging allows us to revalidate this cache entry if the client is updated
    tags: ['clients'],
  }
);
