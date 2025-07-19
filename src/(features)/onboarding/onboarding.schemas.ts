// app/dashboard/(features)/onboarding/onboarding.schemas.ts
import { z } from 'zod/v4';

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export const CreateBusinessSchema = z.object({
  name: z
    .string()
    .min(3, 'Business name must be at least 3 characters.')
    .max(50),
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
      message: 'Please enter a valid URL.',
    })
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(250, 'Description cannot exceed 250 characters.')
    .optional(),
  logo: z
    .file()
    .max(MAX_IMAGE_SIZE, 'Max image size is 5MB')
    .mime(
      ACCEPTED_IMAGE_TYPES,
      'Only .jpg, .jpeg, .png, and .webp formats are supported.'
    )
    .optional(),
  location: z.string().min(1, 'Location is required.'),
});

export type CreateBusinessFormValues = z.infer<typeof CreateBusinessSchema>;
