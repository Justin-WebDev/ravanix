// src/features/appointments/schemas.ts
import { z } from 'zod/v4';

// Schema for an individual item on an appointment
export const CreateAppointmentItemSchema = z.object({
  description: z.string().min(1, 'Item description is required.'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1.'),
  unitPrice: z.coerce.number().min(0, 'Unit price must be a positive number.'),
  serviceId: z.cuid('Invalid service ID.').optional(),
});

export const CreateAppointmentSchema = z
  .object({
    startTime: z.coerce.date({
      error: 'A start time is required.',
    }),
    endTime: z.coerce.date({
      error: 'An end time is required.',
    }),
    status: z.string({
      error: 'An appointment status is required.',
    }),
    notes: z
      .string()
      .max(500, 'Notes cannot exceed 500 characters.')
      .optional(),

    // --- Relations ---
    businessId: z.cuid('A valid business ID is required.'),
    clientId: z.cuid('A client ID is required.'),
    vehicleId: z.cuid('A vehicle ID is required.'),
    assignedToId: z.cuid('Invalid user ID.').optional(),

    // In the future, you might add a field for services like this:
    items: z
      .array(CreateAppointmentItemSchema)
      .min(1, 'At least one service or item is required.'),
  })
  .refine(data => data.endTime > data.startTime, {
    message: 'End time must be after the start time.',
    path: ['endTime'], // This error will be associated with the endTime field
  });
