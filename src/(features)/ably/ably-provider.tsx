'use server';

import { AblyProvider, ChannelProvider } from 'ably/react';
import { getAblyClient } from './ably-client';
import { auth } from '@clerk/nextjs/server';

export async function AblyReactProvider({
  businessId,
  children,
}: {
  businessId: string;
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const client = getAblyClient(userId!, businessId);
  // Render children only after the client is successfully connected
  return (
    <AblyProvider client={client}>
      <ChannelProvider channelName={businessId}>{children}</ChannelProvider>
    </AblyProvider>
  );
}
