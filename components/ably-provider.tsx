'use client';

import { AblyProvider } from 'ably/react';
import Ably from 'ably';
import { ablyAuth } from '@/lib/data-access-layer/ably';
import { useAuth } from '@clerk/nextjs';
import { Suspense, useEffect, useState } from 'react';

// This is a client component that will be rendered on the client
export function AblyReactProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const [client, setClient] = useState<Ably.Realtime | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }
    // We only want to run this code on the client, after the component has mounted.
    const ablyClient = new Ably.Realtime({
      authCallback: async (tokenParams, callback) => {
        try {
          // This call now happens safely after the component has mounted.
          const tokenRequest = await ablyAuth();
          callback(null, tokenRequest);
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : 'Unknown auth error';
          callback(new Ably.ErrorInfo(errorMessage, 50000, 500), null);
        }
      },
    });
    setClient(ablyClient);

    // This is the cleanup function that will be called when the component unmounts.
    return () => {
      ablyClient.close();
    };
  }, [userId]); // The empty dependency array ensures this runs only once.

  if (!client) {
    // Render a loading state or null while the client is being initialized.
    return null;
  }

  return <AblyProvider client={client}>{children}</AblyProvider>;
}
