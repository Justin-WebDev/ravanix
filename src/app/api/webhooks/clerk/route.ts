// ravanix/api/webhooks/clerk/route.ts

import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { type WebhookEvent } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

// const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET?.split('_')[1];

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    const { id } = evt.data;
    const eventType = evt.type;

    console.log(`Webhook with an ID of ${id} and type of ${eventType}`);

    // Handle the event
    if (eventType === 'user.created') {
      await prisma.user.create({
        data: {
          clerkId: evt.data.id,
          email: evt.data.email_addresses[0].email_address,
          firstName: evt.data.first_name,
          lastName: evt.data.last_name,
          imageUrl: evt.data.image_url,
        },
      });
    }

    if (eventType === 'user.updated') {
      await prisma.user.update({
        where: {
          clerkId: evt.data.id,
        },
        data: {
          email: evt.data.email_addresses[0].email_address,
          firstName: evt.data.first_name,
          lastName: evt.data.last_name,
          imageUrl: evt.data.image_url,
        },
      });
    }

    return new Response('', { status: 200 });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error verifying webhook', { status: 400 });
  }
}
