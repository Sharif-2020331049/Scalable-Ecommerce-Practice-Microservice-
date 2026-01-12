import prisma from "@/prisma";
import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { INVENTORY_URL } from "@/config";

const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id;
    const product = await prisma.product.findUnique({   
        where: { id: productId },
        // select: {
        //     id: true,
        //     sku: true,
        //     name: true,
        //     price: true,
        //     description: true,
        //     status: true,
        //     inventoryId: true,
        // }
    }); 

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if(product.inventoryId === null || product.inventoryId === undefined) {
        const {data: inventory} = await axios.post(`${INVENTORY_URL}/inventories`, {
            productId: product.id,
            sku: product.sku,
        });
        console.log('Inventory record created successfully for product', inventory.id);

        // update product and store inventory id
        await prisma.product.update({
            where: { id: product.id },
            data: { inventoryId: inventory.id },
        })

        console.log('Product updated successfully with inventory id: ', inventory.id);

        return  res.status(200).json({
            ...product, 
            inventoryId: inventory.id,
            stock: inventory.quantity || 0,
            stockStatus: inventory.quantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
        });
        
    }
    
    // fetch inventory details
    const {data: inventory} = await axios.get(`${INVENTORY_URL}/inventories/${product.inventoryId}`);

    res.status(200).json({
        ...product, 
        inventoryId: inventory.id,
        stock: inventory.quantity || 0,
        stockStatus: inventory.quantity > 0 ? 'IN STOCK' : 'OUT OF STOCK',
    });
    } catch (error) {
    next(error);
  }
};

export default getProduct;

