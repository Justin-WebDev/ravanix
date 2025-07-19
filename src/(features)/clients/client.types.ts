// src/features/clients/types.ts
import { z } from 'zod/v4';
import { CreateClientSchema, VehicleSchema } from './client.schemas';

export type ClientData = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: Date;
};

// export type CreateClientFormValues = z.infer<typeof CreateClientSchema>;
export type VehicleFormValues = z.infer<typeof VehicleSchema>;
