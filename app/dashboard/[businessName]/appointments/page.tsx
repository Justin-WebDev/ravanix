import prisma from '@/lib/prisma';
import CustomCalendar from './_components/CustomCalendar';

type AppointmentsPageProps = {
  params: {
    businessName: string;
  };
};

// This function will fetch the necessary appointment data from the database.
// This runs on the server.
async function getAppointmentsForBusiness(businessName: string) {
  // In a real application, you would look up the business by its slug (`businessName`)
  // For now, we will fetch all appointments as an example.
  const appointments = await prisma.appointment.findMany({
    // You would add a where clause here to filter by businessId
    select: {
      id: true,
      startTime: true,
      endTime: true,
      client: {
        select: {
          name: true,
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
  });

  // We need to convert Date objects to ISO strings for serialization
  return appointments.map((app: any) => ({
    ...app,
    startTime: app.startTime.toISOString(),
    endTime: app.endTime.toISOString(),
  }));
}

export default async function AppointmentsPage({
  params,
}: AppointmentsPageProps) {
  const appointments = await getAppointmentsForBusiness(params.businessName);

  return (
    <main className='h-full'>
      {/* We pass the server-fetched data to the client component */}
      <CustomCalendar appointmentsData={appointments} />
    </main>
  );
}
