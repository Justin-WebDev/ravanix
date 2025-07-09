'use server';

import { z } from 'zod/v4'; // Using z.v4 to match your client code
import prisma from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { cloudinary } from '@/lib/cloudinary';

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// This server-side schema now exactly matches your client-side schema
const CreateBusinessSchema = z.object({
  name: z.string().min(3).max(50),
  businessType: z.enum(['mobile', 'shop', 'both']),
  address: z.string().min(1, 'Address is required.'),
  city: z.string().min(1, 'City is required.'),
  state: z.string().min(1, 'State is required.'),
  zipCode: z.string().min(5, 'A valid zip code is required.').max(10),
  phone: z.string().optional(),
  website: z
    .url({
      protocol: /^https?$/,
      hostname: z.regexes.domain,
    })
    .optional()
    .or(z.literal('')),
  description: z.string().max(250).optional(),
  // Use .optional() to handle cases where no logo is uploaded
  logo: z.file().max(MAX_IMAGE_SIZE).mime(ACCEPTED_IMAGE_TYPES).optional(),
  location: z.string().min(1, 'Location is required.'),
});

export type FormState = {
  success: boolean;
  message: string | null;
  errors?: Record<string, string[]> | null;
  businessName?: string;
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
    // Pass the logo only if it's a File instance
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
    logo: validatedLogo, // Use the validated logo
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
      where: { id: userId },
    });

    if (existingUser && existingUser.businessId) {
      return {
        success: false,
        message: 'You are already a member of a business.',
        errors: null,
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
        ownerId: userId,
        phone,
        website,
        description,
      },
    });

    await prisma.user.upsert({
      where: { id: userId },
      update: { businessId: newBusiness.id },
      create: {
        id: userId,
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
    businessName: newBusiness.name,
  };
}
