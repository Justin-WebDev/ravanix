// components/ably-provider.tsx

import { ablyAuth } from '@/lib/data-access-layer/ably';
// import { AblyProvider as AblyReactProvider } from '@ably/react';
import { AblyProvider } from 'ably/react';
import Ably from 'ably';

const client = new Ably.Realtime({
  authCallback: async (tokenParams, callback) => {
    try {
      const tokenRequest = await ablyAuth();
      callback(null, tokenRequest);
    } catch (e) {
      callback(e as Ably.ErrorInfo, null);
    }
  },
});

export function AblyReactProvider({ children }: { children: React.ReactNode }) {
  return <AblyProvider client={client}>{children}</AblyProvider>;
}
