// validate user input 
// Get cart items using cartSessionId
// If cart is empty, return 400 error
// Find all product details by the products id from carts 
// Create order and order items 
// invoke email service 
// invoke cart service to clear the cart

import { OrderSchema, CartItemSchema } from "@/schemas";
import { Request, Response, NextFunction } from "express";



const checkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // validate user input 
        const parsedBody = OrderSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({ error: 'Invalid input', message: parsedBody.error.message });
        }

        // get cart details using cartSessionId
        const {data: cartItems} = await axios.get(`${process.env.CART_SERVICE_URL}/cart/me`);

        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(400).json({ error: 'Invalid input', message: error instanceof Error ? error.message : 'Unknown error' });
    }   
}

export default checkout;