import { z } from 'zod/v4';

export const VehicleFormSchema = z.object({
  year: z
    .string()
    .nullable()
    .refine(val => val !== null && val !== '', {
      message: 'Year is required.',
    }),
  make: z
    .string()
    .max(50)
    .nullable()
    .refine(val => val !== null && val !== '', {
      message: 'Make is required.',
    }),
  model: z
    .string()
    .max(50)
    .nullable()
    .refine(val => val !== null && val !== '', {
      message: 'Model is required.',
    }),
  color: z.string().max(50).optional().nullable().or(z.literal('')),
  licensePlate: z.string().max(20).optional().nullable().or(z.literal('')),
  vin: z
    .string()
    .refine(val => !val || val.length === 17, {
      message: 'VIN must be 17 characters if provided.',
    })
    .optional()
    .nullable()
    .or(z.literal('')),
  notes: z.string().max(1000).optional().nullable().or(z.literal('')),
});

export type VehicleFormValues = z.infer<typeof VehicleFormSchema>;
