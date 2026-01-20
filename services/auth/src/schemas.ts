import { z } from 'zod';

export const userCreateSchema = z.object({
  name: z.string().min(3).max(255),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long').max(255)
});

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
});


export const accessTokenSchema = z.object({
  accessToken: z.string(),
});

export const EmailVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string(),
});
