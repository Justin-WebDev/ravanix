// src/features/employees/queries.ts
import prisma from '@/lib/prisma';
import { unstable_cache as cache } from 'next/cache';
import { type Employee } from './employee.types';
import { redirect } from 'next/navigation';

/**
 * Fetches a list of all employees for a given business.
 * This function is cached and revalidated when the 'employees' tag is updated.
 * @param businessId The ID of the business to fetch employees for.
 * @returns A promise that resolves to an array of employee data.
 */
export const getEmployeesForBusiness = cache(
  async (businessId: string | null): Promise<Employee[]> => {
    // If there's no businessId (e.g., during onboarding), return an empty array.
    if (!businessId) {
      redirect('/dashboard/onboarding');
    }

    const employees = await prisma.user.findMany({
      where: {
        businessId: businessId,
      },
      select: {
        id: true,
        clerkId: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    return employees;
  },
  ['employees'], // Cache key prefix
  {
    // Tagging this cache allows us to revalidate it from anywhere.
    tags: ['employees'],
  }
);
