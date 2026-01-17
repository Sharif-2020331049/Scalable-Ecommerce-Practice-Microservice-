import prisma from "@/prisma";
import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { ProductCreateDTOSchema } from "@/schemas";
import { INVENTORY_URL } from "@/config"; 


const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {

   
     
    // Validate request body
    const parseBody = ProductCreateDTOSchema.safeParse(req.body);
    if (!parseBody.success) {
      return res
        .status(400)
        .json({ error: "Invalid request data", details: parseBody.error.issues });
    }


    console.log(req.body);
    console.log(parseBody.success);
    
    

    // check if product with same sku exists
    const existingProduct = await prisma.product.findFirst({
      where: { sku: parseBody.data.sku },
    });
    if (existingProduct) {
      return res.status(409).json({ error: "Product with the same SKU already exists" });
    }


    // create product
    const productData = parseBody.data;
    const product = await prisma.product.create({
      data: productData,
    });
   console.log('Product created successfully', product.id);


   // create a inventory record for the product
    
        const {data: inventory}  = await axios.post(`${INVENTORY_URL}/inventories`, {
            productId: product.id,
            sku: product.sku,
            quantity: 0
        });
        console.log('Inventory record created successfully for product', inventory.id);

    // update product and store inventory id
    await prisma.product.update({
        where: { id: product.id },
        data: { inventoryId: inventory.id },
    })

    console.log('Product updated successfully with inventory id', inventory.id);

      

    res.status(201).json({...product, inventoryId: inventory.id});

  } catch (error) {
    console.error('Error in createProduct:', error);
    next(error);
  }
};

export default createProduct;