import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      business: true,
    },
  });

  if (user?.business) {
    const businessSlug = encodeURIComponent(
      user.business.name.toLowerCase().replace(/\s+/g, '-')
    );
    redirect(`/dashboard/${businessSlug}`);
  } else {
    redirect('/dashboard/onboarding');
  }

  return null;
}
