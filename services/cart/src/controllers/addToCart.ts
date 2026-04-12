import { INVENTORY_SERVICE_URL } from '@/config';
import redis from '@/redis';
import { CartItemSchema } from '@/schema';
import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';

const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // validate request body

    const parsedBody = CartItemSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({ error: parsedBody.error.message });
    }

    let cartSessionId = req.headers['x-cart-session-id'] as string || null;

    // cheak if cart session id is present in header, if not create a new one
    if (cartSessionId) {
      const exist = await redis.exists(`session:${cartSessionId}`);
      console.log("Session Exists: ", exist);

      if (!exist) {
        cartSessionId = null; // if session id is not valid, set it to null to create a new one    
      }

    }

    // if cart session id is not present, create a new one
    if (!cartSessionId) {
      cartSessionId = uuid();
      console.log("New session ID: ", cartSessionId);

      // set the cart session id in redis store with an empty cart and a TTL
      await redis.setex(`session:${cartSessionId}`, process.env.CART_TTL || 60, JSON.stringify([]));

      // set the cart session id in response header
      res.setHeader('x-cart-session-id', cartSessionId);
    }

    // check if the inventory is available
    const { data } = await axios.get(`${INVENTORY_SERVICE_URL}/inventories/${parsedBody.data.inventoryID}`);

    if (Number(data.quantity) < parsedBody.data.quantity) {
      return res.status(400).json({ error: 'Insufficient inventory' });
    }

    // add item to cart

    //TODO: check if the product already exists in the cart, if yes then update the quantity instead of adding a new item
    // Logic: parsedBody.data.quantity - existing quantity  

    await redis.hset(
      `cart:${cartSessionId}`,
      parsedBody.data.productId,
      JSON.stringify({
        inventoryID: parsedBody.data.inventoryID,
        quantity: parsedBody.data.quantity
      })
    );


    console.log({
      quantity: parsedBody.data.quantity,
      actionType: "OUT"
    });
    // update inventories
    await axios.put(`${INVENTORY_SERVICE_URL}/inventories/${parsedBody.data.inventoryID}`, {
      quantity: parsedBody.data.quantity,
      actionType: "Out"
    });

    return res.status(200).json({ message: 'Item added to cart successfully', cartSessionId });


  } catch (err) {
    next(err);
  }

};


export default addToCart;