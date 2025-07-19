// src/app/features/clients/client.schemas.ts
import { z } from 'zod/v4';

// The VehicleSchema now uses z.preprocess for number coercion, the correct Zod v4 pattern.
export const VehicleSchema = z.object({
  make: z.string().min(1, 'Make is required.'),
  model: z.string().min(1, 'Model is required.'),
  // z.preprocess is used to convert the input to a number before validation.
  year: z.preprocess(
    val => parseInt(String(val), 10),
    z
      .number()
      .min(1900, 'Invalid year.')
      .max(new Date().getFullYear() + 1, 'Year cannot be in the future.')
  ),
  color: z.string().optional(),
  plate: z.string().optional(),
  vin: z.string().optional(),
  notes: z.string().optional(),
});

// This is the schema that represents the fields in your UI form.
export const ClientFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.email('Invalid email address.').optional().or(z.literal('')),
  phone: z.string().optional(),
  vehicles: z.array(VehicleSchema),
  // Address fields
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

// This is the final, exported schema that includes all your business logic.
export const CreateClientSchema = ClientFormSchema.refine(
  data => {
    // Conditional validation: if address is provided, city, state, and zip are required.
    if (data.address && data.address.trim() !== '') {
      return (
        !!data.city &&
        data.city.trim() !== '' &&
        !!data.state &&
        data.state.trim() !== '' &&
        !!data.zipCode &&
        data.zipCode.trim() !== ''
      );
    }
    return true;
  },
  {
    message:
      'City, State, and Zip Code are required when providing a street address.',
    path: ['city'],
  }
).transform(data => {
  // `.transform` reshapes the validated data to match the database model.
  const {
    firstName,
    lastName,
    address,
    city,
    state,
    zipCode,
    ...rest // Contains email, phone, and vehicles
  } = data;

  // Combine first and last name into a single `name` field.
  const name = `${firstName} ${lastName}`.trim();

  // Combine address components into a single `address` string.
  let fullAddress: string | undefined = undefined;
  if (address && city && state && zipCode) {
    fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
  }

  // Return the final object shape for the database.
  return {
    ...rest,
    name,
    address: fullAddress,
  };
});

// Type for the form's input values (before transformation).
export type CreateClientFormValues = z.infer<typeof ClientFormSchema>;

// Type for a single vehicle in the form.
export type VehicleFormValues = z.infer<typeof VehicleSchema>;
