import { z } from 'zod';


export const userCreateSchema = z.object({
      authUserId: z.string(), 
      name: z.string(),
      email: z.string().email(),
      // password: z.string().min(6).max(100),
      
      address: z.string().optional(),
      phone: z.string().optional(),
});

// for user update, all fields are opitional except authUserId

// export const userUpdateSchema = z.object({
//       name: z.string().optional(),
//       email: z.string().email().optional(),
//       address: z.string().optional(),
//       phone: z.string().optional(),
// });


// Using omit to exclude authUserId from being optional field
// partial to make all other fields optional
export const userUpdateSchema = userCreateSchema.omit({ authUserId: true }).partial();

