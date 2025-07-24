import * as Ably from 'ably';
import { createTokenRequest } from './ably-auth';
// import { auth } from '@clerk/nextjs/server';
// import { redirect } from 'next/navigation';
// import prisma from '@/lib/prisma';

// let ablyClient: Ably.Realtime | null = null;

export function getAblyClient(userId: string, businessId: string) {
  // const { userId } = await auth();

  // if (!userId) redirect('/sign-in');

  // if (!businessId) redirect('/dashboard/onboarding');

  // if (!ablyClient) {
  const ablyClient = new Ably.Realtime({
    authCallback: async (tokenParams, callback) => {
      try {
        const tokenRequest = await createTokenRequest(userId);
        callback(null, tokenRequest);
      } catch (error) {
        callback(error as Ably.ErrorInfo, null);
      }
    },
    clientId: userId,
  });
  // }
  return ablyClient;
}

// export function closeAblyClient() {
//   if (ablyClient) {
//     ablyClient.connection.close();
//     ablyClient = null;
//   }
// }
