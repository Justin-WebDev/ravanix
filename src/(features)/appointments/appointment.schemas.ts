// src/features/appointments/appointment.schemas.ts
import { z } from 'zod/v4';

// Schema for an individual item on an appointment
export const CreateAppointmentItemSchema = z.object({
  description: z.string().min(1, 'Item description is required.'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1.'),
  unitPrice: z.coerce.number().min(0, 'Unit price must be a positive number.'),
  serviceId: z.cuid('Invalid service ID.').optional(),
});

// This is the new base schema that matches the form's structure.
export const AppointmentFormSchema = z
  .object({
    // --- Client Details ---
    clientId: z.cuid().optional(),
    clientFirstName: z.string().min(1, 'First name is required.'),
    clientLastName: z.string().min(1, 'Last name is required.'),
    clientEmail: z.email('Invalid email address.').optional().or(z.literal('')),
    clientPhone: z.string().optional(),
    clientAddress: z.string().optional(),
    clientCity: z.string().optional(),
    clientState: z.string().optional(),
    clientZipCode: z.string().optional(),

    // --- Appointment Details ---
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
    vehicleId: z.cuid('A vehicle ID is required.'),
    assignedToId: z.cuid('Invalid user ID.').optional(),

    items: z
      .array(CreateAppointmentItemSchema)
      .min(1, 'At least one service or item is required.'),
  })
  .refine(data => data.endTime > data.startTime, {
    message: 'End time must be after the start time.',
    path: ['endTime'],
  });

// This is the final schema for the server action, which includes the transformation.
export const CreateAppointmentSchema = AppointmentFormSchema.transform(data => {
  const {
    clientId,
    clientFirstName,
    clientLastName,
    clientEmail,
    clientPhone,
    clientAddress,
    clientCity,
    clientState,
    clientZipCode,
    ...appointmentData
  } = data;

  // Combine address parts into a single string for the database.
  const fullAddress = [clientAddress, clientCity, clientState, clientZipCode]
    .filter(Boolean) // Remove any empty/null parts
    .join(', ');

  const clientDetails = {
    id: clientId,
    name: `${clientFirstName} ${clientLastName}`.trim(), // Combine first and last name
    email: clientEmail,
    phone: clientPhone,
    address: fullAddress,
  };

  return {
    clientDetails,
    appointmentData,
  };
});

// This is the correct type for our form.
export type NewAppointmentFormValues = z.infer<typeof AppointmentFormSchema>;
