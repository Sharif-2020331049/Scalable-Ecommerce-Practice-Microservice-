import { z } from 'zod';

export const CartItemSchema = z.object({
    productId: z.string(),
    inventoryID: z.string(),
    quantity: z.number().int().positive(),
});