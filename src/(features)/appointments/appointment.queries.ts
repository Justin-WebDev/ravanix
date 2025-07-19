// src/features/appointments/queries.ts
import prisma from '@/lib/prisma';
import { unstable_cache as cache } from 'next/cache';

// A more detailed type that reflects all the data we're fetching for the calendar view.
export type AppointmentForCalendar = {
  id: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  status: string;
  client: { name: string } | null;
  vehicle: { make: string; model: string; year: number } | null;
  assignedTo: { firstName: string | null; lastName: string | null } | null;
  items: { description: string | null; service: { name: string } | null }[];
};

export const getAppointmentsForBusiness = cache(
  async (
    businessName: string,
    userId: string | null
  ): Promise<AppointmentForCalendar[]> => {
    if (!userId) {
      return [];
    }

    const business = await prisma.business.findFirst({
      where: {
        name: decodeURIComponent(businessName),
        // In a multi-tenant app, ensuring the user is part of the business is crucial.
        // This assumes a user can be an owner or an employee.
        OR: [{ ownerId: userId }, { employees: { some: { clerkId: userId } } }],
      },
      select: { id: true },
    });

    if (!business) {
      return [];
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        businessId: business.id,
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        client: {
          select: {
            name: true,
          },
        },
        vehicle: {
          select: {
            make: true,
            model: true,
            year: true,
          },
        },
        assignedTo: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        items: {
          select: {
            description: true,
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // We convert Date objects to ISO strings for serialization.
    return appointments.map((app: any) => ({
      ...app,
      startTime: app.startTime.toISOString(),
      endTime: app.endTime.toISOString(),
    }));
  },
  ['appointments'], // Cache key prefix
  {
    tags: ['appointments'], // Cache tag for revalidation
  }
);
