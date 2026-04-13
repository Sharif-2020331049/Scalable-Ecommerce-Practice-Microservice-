import { INVENTORY_SERVICE_URL } from "@/config";
import redis from "@/redis";
import axios from "axios";


export const clearCart = async (cartSessionId: string) => {
    try {
        const data = await redis.hgetall(`cart:${cartSessionId}`);

        if(Object.keys(data).length === 0) {
            console.log(`Cart with session ID ${cartSessionId} is already empty.`);
            return;
        }

        const items = Object.keys(data).map(key => {
            const { quantity,inventoryId } = JSON.parse(data[key]) as {
                quantity: number;
                inventoryId: string;
            };


            return {
                inventoryId,
                quantity,
                productId: key
            }
        });


        // TODO: We don't have any api to update 10 products inventory in one request,
        //  we need to make multiple requests to update the inventory for each product. 
        // We can optimize this by creating a new api in inventory service 
        // to update multiple products inventory in one request.
        //  -> means bulk request to inventory service with all the products 
        // in the cart and their quantities to update the inventory in one go.

        
        // update inventory for each product in the cart
        const requests = items.map(item => {
            return axios.put(`${INVENTORY_SERVICE_URL}/inventories/${item.inventoryId}`, {
                 quantity: item.quantity,
                 actionType: "In"
            });
        });

        await Promise.all(requests);
        console.log("Inventory Updated!");
        
        // clear the cart
        await redis.del(`cart:${cartSessionId}`);

    }catch (err) {
        console.error('Error occurred while clearing cart: ', err);
    }





}