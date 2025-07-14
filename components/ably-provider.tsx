'use client';

import { AblyProvider } from 'ably/react';
import Ably, { Realtime } from 'ably';
import { ablyAuth } from '@/lib/data-access-layer/ably';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

const dummyClient = new Ably.Realtime({ key: 'dummy:key', autoConnect: false });

export function AblyReactProvider({ children }: { children: React.ReactNode }) {
  const { userId, isLoaded } = useAuth();
  const [client, setClient] = useState<Ably.Realtime | undefined>(dummyClient);

  useEffect(() => {
    if (userId) {
      const ablyClient = new Realtime({
        authCallback: async (tokenParams, callback) => {
          try {
            const tokenRequest = await ablyAuth();
            callback(null, tokenRequest);
          } catch (err) {
            const errorMessage =
              err instanceof Error ? err.message : 'Unknown auth error';
            callback(new Ably.ErrorInfo(errorMessage, 50000, 500), null);
          }
        },
        clientId: userId,
      });
      setClient(ablyClient);

      return () => {
        ablyClient.close();
      };
    }
  }, [userId]);

  return <AblyProvider client={client}>{children}</AblyProvider>;
}
