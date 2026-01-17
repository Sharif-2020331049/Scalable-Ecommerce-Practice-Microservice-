import { z } from 'zod';


export const userCreateSchema = z.object({
      name: z.string().min(2).max(100),
      email: z.string().email(),
      // password: z.string().min(6).max(100),
      
      address: z.string().min(5).max(200).optional(),
      phone: z.string().min(7).max(15).optional(),
});


