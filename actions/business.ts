'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cloudinary } from '@/lib/cloudinary';

const CreateBusinessSchema = z.object({
  name: z.string().min(3, { message: 'Must be 3 or more characters' }),
  businessType: z.enum(['mobile', 'shop', 'both']),
  address: z.string().min(1, { message: 'Address is required' }),
  city: z.string().min(1, { message: 'City is required' }),
  state: z.string().min(1, { message: 'State is required' }),
  zipCode: z.string().min(5, { message: 'A valid zip code is required' }),
  location: z.string().min(1, { message: 'Location is required' }),
  logo: z
    .instanceof(File)
    .optional()
    .refine(
      file => !file || file.size <= 5 * 1024 * 1024,
      `Max image size is 5MB.`
    ),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
});

export type FormState = {
  success: boolean;
  message: string | null;
  errors?: Record<string, string[]> | null;
};

export async function createBusiness(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return {
      message: 'You must be signed in to create a business.',
      success: false,
    };
  }

  const validatedFields = CreateBusinessSchema.safeParse({
    name: formData.get('name'),
    logo: formData.get('logo'),
    businessType: formData.get('businessType'),
    address: formData.get('address'),
    city: formData.get('city'),
    state: formData.get('state'),
    zipCode: formData.get('zipCode'),
    location: formData.get('location'),
    phone: formData.get('phone'),
    website: formData.get('website'),
    description: formData.get('description'),
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
    logo,
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

  try {
    // Check if user is already in a business
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (existingUser && existingUser.businessId) {
      return {
        success: false,
        message: 'You are already a member of a business.',
        errors: null,
      };
    }

    if (logo && logo.size > 0) {
      // Convert file to buffer
      const arrayBuffer = await logo.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      // Upload to Cloudinary
      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              tags: ['business_logo'],
            },
            (error, result) => {
              if (error) {
                reject(error);
                return;
              }
              resolve(result);
            }
          )
          .end(buffer);
      });

      logoUrl = uploadResult.secure_url;
    }

    const newBusiness = await prisma.business.create({
      data: {
        name,
        logoUrl,
        businessType,
        address,
        city,
        state,
        zipCode,
        location,
        ownerId: userId,
        phone,
        website,
        description,
      },
    });

    await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        businessId: newBusiness.id,
      },
      create: {
        clerkId: userId,
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        businessId: newBusiness.id,
      },
    });
  } catch (error) {
    console.error('Failed to create business:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
      errors: null,
    };
  }

  revalidatePath('/dashboard/onboarding');
  revalidatePath('/dashboard');
  return {
    success: true,
    message: 'Business created successfully! Redirecting to your dashboard...',
  };
}

export async function joinBusiness(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return {
      message: 'You must be signed in to join a business.',
      success: false,
    };
  }

  const businessId = formData.get('businessId');
  if (!businessId || typeof businessId !== 'string') {
    return {
      success: false,
      message: 'No business selected.',
    };
  }

  try {
    // Ensure user exists in our database
    const dbUser = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });

    // Check if user is already in a business
    if (dbUser.businessId) {
      return {
        success: false,
        message: 'You are already a member of a business.',
      };
    }

    // Check if business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business) {
      return {
        success: false,
        message: 'Business not found.',
      };
    }

    // Check if a pending join request already exists
    const existingRequest = await prisma.joinRequest.findFirst({
      where: {
        userId: dbUser.id,
        businessId: businessId,
        status: 'pending',
      },
    });
    if (existingRequest) {
      return {
        success: false,
        message:
          'You have already requested to join this business. Please wait for approval.',
      };
    }

    // Create a new join request
    await prisma.joinRequest.create({
      data: {
        userId: dbUser.id,
        businessId: businessId,
        status: 'pending',
      },
    });
  } catch (error) {
    console.error('Failed to request to join business:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }

  revalidatePath('/dashboard/onboarding');
  revalidatePath('/dashboard');
  return {
    success: true,
    message: 'Join request submitted! Redirecting to your dashboard...',
  };
}

type Unpacked<T> = T extends (infer U)[] ? U : T;
export type BusinessForJoining = Unpacked<
  Awaited<ReturnType<typeof fetchBusinesses>>
>;

export async function fetchBusinesses() {
  const businesses = await prisma.business.findMany({
    select: {
      id: true,
      name: true,
      logoUrl: true,
      businessType: true,
      address: true,
      city: true,
      state: true,
      zipCode: true,
      phone: true,
      website: true,
      description: true,
      location: true,
      createdAt: true,
      ownerId: true,
      _count: {
        select: { members: true },
      },
    },
  });
  return businesses.map(b => {
    const { _count, ...businessData } = b;
    return {
      ...businessData,
      businessType: b.businessType as 'mobile' | 'shop' | 'both',
      members: _count.members,
      description: b.description ?? '',
      phone: b.phone ?? '',
      website: b.website ?? '',
    };
  });
}
