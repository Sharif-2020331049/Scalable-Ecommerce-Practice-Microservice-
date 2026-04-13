import redis from "@/redis";
import {Request, Response, NextFunction } from "express";

const clearCart = async (req:Request, res:Response, next: NextFunction) => {
    try{
        const cartSessionId = req.headers['cart-session-id'] as string || null;

        if(!cartSessionId) {
            return res.status(400).json({ message: 'Cart is already empty' });
        }

        // check if the sesssion id exits in the store
        const exits = await redis.exists(`cart:${cartSessionId}`);

        if(!exits) {
            delete req.headers['cart-session-id'];
            return res.status(404).json({ message: 'Cart not found' });
        }

        // clear the cart
        await redis.del(`sessions:${cartSessionId}`);
        await redis.del(`cart:${cartSessionId}`);
        
        delete req.headers['cart-session-id'];

        res.status(200).json({ message: 'Cart cleared successfully' });

    }catch (err) {
        console.error('Error occurred while clearing cart: ', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}



export default clearCart;