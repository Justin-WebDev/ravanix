// src/features/employees/types.ts

/**
 * Defines the shape of an employee's data as it will be used
 * throughout the application, particularly in the navigation sidebar.
 */
export type Employee = {
  id: string; // The internal CUID from our database
  clerkId: string; // The ID from Clerk for real-time presence
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
};
