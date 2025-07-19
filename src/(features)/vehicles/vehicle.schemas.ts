// src/features/vehicles/schemas.ts
import { z } from 'zod/v4';

export const VehicleSchema = z.object({
  make: z.string().min(1, 'Make is required.'),
  model: z.string().min(1, 'Model is required.'),
  year: z.coerce
    .number()
    .int()
    .min(1900, 'Please enter a valid year.')
    .max(new Date().getFullYear() + 2, 'Year cannot be too far in the future.'),
  color: z.string().max(50).optional().nullable(),
  plate: z.string().max(20).optional().nullable(),
  vin: z
    .string()
    .length(17, 'VIN must be 17 characters.')
    .optional()
    .nullable(),
  notes: z.string().max(1000).optional().nullable(),

  // Relation
  clientId: z.cuid('A client ID is required.'),
});

// We'll also define a schema for updates, which includes the vehicle ID.
export const UpsertVehicleSchema = VehicleSchema.extend({
  id: z.cuid().optional(),
});
