// app/dashboard/(features)/onboarding/_actions/business.actions.ts
'use server';

import { z } from 'zod/v4';
import prisma from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { cloudinary } from '@/lib/cloudinary';
import { CreateBusinessSchema } from './business.schemas';
import bcrypt from 'bcryptjs';

// This type is for the createBusiness form
export type CreateBusinessFormState = {
  success: boolean;
  message: string | null;
  errors?: Record<string, string[]> | null;
  businessName?: string;
};

// This type is specifically for the joinBusiness form's more complex state
export type JoinBusinessFormState = {
  success: boolean;
  message: string | null;
  // Use a generic error field for non-input specific messages
  error?: string;
  // This flag tells the UI to show the code input
  requiresCode?: boolean;
  // We pass the businessId back to the form to maintain state
  businessId?: string;
};

// This defines the shape of the business data returned for the join list
export type BusinessForJoining = {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  description: string | null;
  businessType: string;
};

export async function createBusiness(
  prevState: CreateBusinessFormState | null,
  formData: FormData
): Promise<CreateBusinessFormState> {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return {
      message: 'You must be signed in to create a business.',
      success: false,
    };
  }

  const logo = formData.get('logo');
  const validatedFields = CreateBusinessSchema.safeParse({
    name: formData.get('name'),
    businessType: formData.get('businessType'),
    address: formData.get('address'),
    city: formData.get('city'),
    state: formData.get('state'),
    zipCode: formData.get('zipCode'),
    location: formData.get('location'),
    phone: formData.get('phone'),
    website: formData.get('website'),
    description: formData.get('description'),
    logo: logo instanceof File && logo.size > 0 ? logo : undefined,
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      success: false,
      message: 'Validation failed. Please check the fields.',
      errors: fieldErrors,
    };
  }

  const {
    name,
    logo: validatedLogo,
    businessType,
    address,
    city,
    state,
    zipCode,
    location,
    phone,
    website,
    description,
  } = validatedFields.data;
  let logoUrl = null;
  let newBusiness;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!existingUser) {
      // This case should be rare if webhooks are set up, but is a good safeguard
      return {
        success: false,
        message: 'User profile not found. Please try again.',
      };
    }

    if (existingUser && existingUser.businessId) {
      return {
        success: false,
        message: 'You are already a member of a business.',
      };
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

    newBusiness = await prisma.business.create({
      data: {
        name,
        logoUrl,
        businessType,
        address,
        city,
        state,
        zipCode,
        ownerId: userId, // This is the clerkId
        phone,
        website,
        description,
        location,
      },
    });

    await prisma.user.update({
      where: { clerkId: userId },
      data: { businessId: newBusiness.id },
    });
  } catch (error) {
    console.error('Failed to create business:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }

  revalidatePath('/dashboard/onboarding');
  revalidatePath('/dashboard');
  return {
    success: true,
    message: 'Business created successfully! Redirecting to your dashboard...',
    businessName: newBusiness.name,
  };
}

export async function joinBusiness(
  prevState: JoinBusinessFormState | null,
  formData: FormData
): Promise<JoinBusinessFormState> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, message: 'You must be signed in.' };
  }

  const businessId = formData.get('businessId') as string;
  const joinCode = formData.get('joinCode') as string | null;

  if (!businessId) {
    return { success: false, message: 'Please select a business to join.' };
  }

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

    // Create a join request for the owner to approve
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
    // Handle cases where the user might already have a pending request
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
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}

export async function fetchBusinesses(): Promise<BusinessForJoining[]> {
  const businesses = await prisma.business.findMany({
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
  return businesses;
}
