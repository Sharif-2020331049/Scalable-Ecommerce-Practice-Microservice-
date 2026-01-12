import { Request, Response, NextFunction} from 'express'
import prisma from '@/prisma'

import { InventoryCreateDTOSchema } from '@/schemas';
import { ActionType } from '../../generated/prisma/client';



const createInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const parsedData = InventoryCreateDTOSchema.parse(req.body);

    // difference between parse and safeParse:
    /*
    parse(): Validates data and throws an error if validation fails; use it when you want to rely on `try/catch` and fail fast.
    safeParse(): Validates data and never throws; returns `{ success, data | error }`, letting you handle validation errors manually.

    */

    // either use parse or safeParse
    const parseBody = InventoryCreateDTOSchema.safeParse(req.body); 
    
    // Validation request body
    if (!parseBody.success) {
      return res.status(400).json({ error: 'Invalid request data', details: parseBody.error.issues});
    }

  
    // create inventory
    const inventory = await prisma.inventory.create({
      data: {
           ...parseBody.data, 
           histories: {
             create: {
                actionType: ActionType.In,
                quantityChanged: parseBody.data.quantity,
                lastQuantity: 0,
                newQuantity: parseBody.data.quantity,


             }
           }
        },
        select: {
           id: true, 
           quantity: true 
          }
    });

    
    return res.status(201).json(inventory);
  } catch (error) {
    console.error('Error creating inventory:', error);
    return res.status(400).json({ 
      error: 'Invalid request data', 
      details: error instanceof Error ? error.message : error 
    });
  }
}

export default createInventory;