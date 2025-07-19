// src/features/onboarding/types.ts
import { z } from 'zod/v4';
import { CreateBusinessSchema } from './onboarding.schemas';

/**
 * Defines the shape of the business data returned for the public list of businesses
 * that users can join.
 */
export type BusinessForJoining = {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  description: string | null;
  businessType: string;
};

/**
 * Type for the form's input values, inferred directly from the Zod schema.
 */
export type CreateBusinessFormValues = z.infer<typeof CreateBusinessSchema>;
