import { Request, Response, NextFunction } from 'express';
import { ProductUpdateDTOSchema } from '../schemas';
import prisma from '@/prisma';

const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { id } = req.params;

        // verify if the request body is valid
        const parsedBody = ProductUpdateDTOSchema.safeParse(req.body); 

        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.message });
        }

        // check if the product exists
        const existingProduct = await prisma.product.findUnique({ where: { id } });
        if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        

        // update the product 
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: parsedBody.data
        });

        res.status(200).json(updatedProduct);


    }catch (err) {
        next(err);
    }
}

export default updateProduct;