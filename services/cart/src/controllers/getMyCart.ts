import redis from '@/redis';
import { Request, Response, NextFunction } from 'express';

const getMyCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cartSessionId = req.headers['x-cart-session-id'] as string || null;

        if (!cartSessionId) {
            return res.status(200).json({ data: [] });
        }

        // check if the session exists in the store, if not return empty cart
        const session= await redis.exists(`session:${cartSessionId}`);

        if(!session) {
            await redis.del(`cart:${cartSessionId}`); // clean up any cart data if session is expired
            return res.status(200).json({ data: [] });
        }

        const cartItems = await redis.hgetall(`cart:${cartSessionId}`);

        if(Object.keys(cartItems).length === 0) {
            return res.status(200).json({ data: [] });
        }

        // format the cart items
        const formattedCartItems = Object.keys(cartItems).map( keys => {
             const { quantity, inventoryID} = JSON.parse(cartItems[keys]) as {
                inventoryID: string;
                quantity: number;
             };

             return {
                productId: keys,
                inventoryID,
                quantity
             }
        });

        return res.status(200).json({ data: formattedCartItems });

    } catch (err) {
        next(err);
    }

}


export default getMyCart;