// src/features/vehicles/queries.ts
import { unstable_cache as cache } from 'next/cache';
import { type SelectOption } from './vehicle.types';
import prisma from '@/lib/prisma';

const NHTSA_API_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';

/**
 * Fetches a list of vehicle makes for a given year from the NHTSA API.
 * The results are cached to improve performance.
 */
export const getVehicleMakes = cache(
  async (year: number): Promise<SelectOption[]> => {
    if (!year) return [];

    try {
      // The API endpoint for makes does not require the year, but we include it in the cache key.
      const response = await fetch(
        `${NHTSA_API_BASE_URL}/GetMakesForVehicleType/car?format=json`
      );
      if (!response.ok) {
        console.error(`NHTSA API error for makes: ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      const makes = data.Results.map((make: { MakeName: string }) => ({
        value: make.MakeName.trim(),
        label: make.MakeName.trim(),
      })).sort((a: SelectOption, b: SelectOption) =>
        a.label.localeCompare(b.label)
      );

      // Deduplicate makes
      const uniqueMakes = makes.filter(
        (make: SelectOption, index: number, self: SelectOption[]) =>
          index ===
          self.findIndex(
            m => m.label.toLowerCase() === make.label.toLowerCase()
          )
      );

      return uniqueMakes;
    } catch (error) {
      console.error('Failed to fetch vehicle makes:', error);
      return [];
    }
  },
  ['vehicle-makes'], // Cache key prefix
  {
    // Revalidate cached data every day to get potential new makes
    revalidate: 60 * 60 * 24,
  }
);

/**
 * Fetches a list of vehicle models for a given year and make from the NHTSA API.
 * The results are cached to improve performance.
 */
export const getVehicleModels = cache(
  async (year: number, make: string): Promise<SelectOption[]> => {
    if (!year || !make) return [];

    try {
      const response = await fetch(
        `${NHTSA_API_BASE_URL}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`
      );
      if (!response.ok) {
        console.error(`NHTSA API error for models: ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      const models = data.Results.map((model: { Model_Name: string }) => ({
        value: model.Model_Name.trim(),
        label: model.Model_Name.trim(),
      })).sort((a: SelectOption, b: SelectOption) =>
        a.label.localeCompare(b.label)
      );

      return models;
    } catch (error) {
      console.error(`Failed to fetch models for ${make} (${year}):`, error);
      return [];
    }
  },
  ['vehicle-models'], // Cache key prefix
  {
    revalidate: 60 * 60 * 24, // Revalidate daily
  }
);

// --- QUERY FOR VEHICLE SELECTION ---

/**
 * Fetches a simplified list of vehicles for a given client,
 * intended for use in select/dropdown components.
 */
export const getVehiclesForClient = cache(
  async (
    clientId: string | null,
    userId: string | null
  ): Promise<SelectOption[]> => {
    if (!clientId || !userId) {
      return [];
    }

    // Authorization check: Ensures the requested client belongs to the user's business.
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
      select: { id: true },
    });

    // If the client doesn't exist or the user is not authorized, return empty.
    if (!client) {
      return [];
    }

    const vehicles = await prisma.vehicle.findMany({
      where: {
        clientId: clientId,
      },
      select: {
        id: true,
        year: true,
        make: true,
        model: true,
      },
      orderBy: {
        year: 'desc',
      },
    });

    // Format the data into a user-friendly label for the dropdown
    return vehicles.map((v: any) => ({
      value: v.id,
      label: `${v.year} ${v.make} ${v.model}`,
    }));
  },
  ['vehicles-for-client'], // A unique cache key prefix
  {
    // Tagged with both clients and appointments so it can be revalidated from multiple places
    tags: ['clients', 'appointments'],
  }
);
