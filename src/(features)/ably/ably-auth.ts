import * as Ably from 'ably';

export async function createTokenRequest(clientId: string) {
  const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY! });
  return await ably.auth.createTokenRequest({ clientId });
}
