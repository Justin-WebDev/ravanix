// src/lib/ably.ts
'use server';
import * as Ably from 'ably';
import { auth } from '@clerk/nextjs/server';

export async function ablyAuth() {
  const { userId } = await auth();

  if (!process.env.ABLY_API_KEY) {
    throw new Error('Ably API key not set.');
  }

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const client = new Ably.Rest(process.env.ABLY_API_KEY);
  const tokenRequestData = await client.auth.createTokenRequest({
    clientId: userId,
  });

  return tokenRequestData;
}
