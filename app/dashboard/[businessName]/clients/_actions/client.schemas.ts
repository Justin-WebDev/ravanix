import { z } from 'zod/v4';

// A schema for a single vehicle
export const VehicleSchema = z.object({
  make: z.string().min(1, 'Make is required.'),
  model: z.string().min(1, 'Model is required.'),
  year: z.coerce
    .number()
    .min(1900, 'Invalid year.')
    .max(new Date().getFullYear() + 1),
  color: z.string().optional(),
  plate: z.string().optional(),
  vin: z.string().optional(),
  notes: z.string().optional(),
});

// The main client schema now accepts an array of vehicles
export const CreateClientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.email('Invalid email address.').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  vehicles: z.array(VehicleSchema).min(1, 'At least one vehicle is required.'),
});

export type CreateClientFormValues = z.infer<typeof CreateClientSchema>;
export type VehicleFormValues = z.infer<typeof VehicleSchema>;
