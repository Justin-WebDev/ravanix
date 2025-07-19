// src/(features)/onboarding/onboarding.actions.ts
'use server';

import { z } from 'zod/v4';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

import prisma from '@/lib/prisma';
import { cloudinary } from '@/lib/cloudinary';
import { executeSafeAction } from '@/lib/safe-action';
import { CreateBusinessSchema } from './onboarding.schemas';
import { BusinessForJoining } from './onboarding.types';

// --- NEW: Instantiate the Rate Limiter ---
// This will allow 5 requests per minute from a single IP address.
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
  prefix: '@upstash/ratelimit',
});

// --- CREATE BUSINESS ACTION ---

type CreateBusinessInput = z.infer<typeof CreateBusinessSchema>;

export async function createBusiness(
  prevState: unknown,
  input: CreateBusinessInput
) {
  return executeSafeAction(
    CreateBusinessSchema,
    input,
    async (validatedData, { userId }) => {
      const { logo: validatedLogo, ...businessData } = validatedData;
      let logoUrl = null;

      try {
        const existingUser = await prisma.user.findUnique({
          where: { clerkId: userId },
        });
        if (!existingUser) {
          return { serverError: 'User profile not found. Please try again.' };
        }
        if (existingUser.businessId) {
          return { serverError: 'You are already a member of a business.' };
        }

        if (validatedLogo) {
          const arrayBuffer = await validatedLogo.arrayBuffer();
          const buffer = new Uint8Array(arrayBuffer);
          const uploadResult: any = await new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream({ tags: ['business_logo'] }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
              })
              .end(buffer);
          });
          logoUrl = uploadResult.secure_url;
        }

        const newBusiness = await prisma.business.create({
          data: {
            ...businessData,
            logoUrl,
            ownerId: userId,
          },
        });

        await prisma.user.update({
          where: { clerkId: userId },
          data: { businessId: newBusiness.id },
        });

        revalidatePath('/dashboard/onboarding');
        revalidatePath('/dashboard');

        return {
          data: {
            message: 'Business created successfully! Redirecting...',
            businessName: newBusiness.name,
          },
        };
      } catch (error) {
        console.error('Failed to create business:', error);
        return {
          serverError: 'An unexpected error occurred. Please try again.',
        };
      }
    }
  );
}

// --- JOIN BUSINESS & FETCH BUSINESSES ACTIONS ---

const JoinBusinessSchema = z.object({
  businessId: z.cuid(),
  joinCode: z.string().optional(),
});

export async function joinBusiness(prevState: unknown, formData: FormData) {
  const header = await headers();
  const ip = header.get('x-forwarded-for') ?? '127.0.0.1';
  const { success: rateLimitSuccess } = await ratelimit.limit(ip);

  if (!rateLimitSuccess) {
    return {
      success: false,
      message: 'Too many requests. Please try again in a minute.',
    };
  }

  const { userId } = await auth();
  if (!userId) {
    // This return shape is custom to handle the complex state of the join form.
    return { success: false, message: 'You must be signed in.' };
  }

  const validatedFields = JoinBusinessSchema.safeParse({
    businessId: formData.get('businessId'),
    joinCode: formData.get('joinCode'),
  });

  if (!validatedFields.success) {
    return { success: false, message: 'Invalid input.' };
  }

  const { businessId, joinCode } = validatedFields.data;

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { joinCode: true, name: true },
    });

    if (!business) {
      return { success: false, message: 'Business not found.' };
    }

    if (business.joinCode) {
      if (!joinCode) {
        return {
          success: false,
          message: `This business requires a join code.`,
          requiresCode: true,
          businessId: businessId,
        };
      }
      const isCodeValid = await bcrypt.compare(joinCode, business.joinCode);
      if (!isCodeValid) {
        return {
          success: false,
          message: 'The join code is incorrect.',
          requiresCode: true,
          businessId: businessId,
        };
      }
    }

    await prisma.joinRequest.create({
      data: {
        userId: userId, // This should be our internal CUID, assuming user is synced
        businessId: businessId,
      },
    });

    revalidatePath('/dashboard');
    return {
      success: true,
      message: `Your request to join "${business.name}" has been sent!`,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Unique constraint failed')
    ) {
      return {
        success: false,
        message: 'You have already sent a request to join this business.',
      };
    }
    console.error('Failed to join business:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

async function fetchBusinesses(): Promise<BusinessForJoining[]> {
  return prisma.business.findMany({
    select: {
      id: true,
      name: true,
      location: true,
      city: true,
      state: true,
      description: true,
      businessType: true,
    },
  });
}

export async function fetchBusinessesAction(): Promise<BusinessForJoining[]> {
  const { userId } = await auth();
  if (!userId) {
    return [];
  }
  return fetchBusinesses();
}
