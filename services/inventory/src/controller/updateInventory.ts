import prisma from '@/prisma'
import { Request, Response, NextFunction} from 'express'
import { InventoryUpdateDTOSchema } from '@/schemas';


const updateInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {

    //  check if inventory exists
    const { id } = req.params;
    // const { quantity, actionType } = InventoryUpdateDTOSchema.parse(req.body);
   
    // Fetch existing inventory
    const inventory = await prisma.inventory.findUnique({
      where: { id },
    }); 
    
    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }


    //  update the inventory 
    const parseBody = InventoryUpdateDTOSchema.safeParse(req.body);

    // Validation request body
    if (!parseBody.success) {
      return res.status(400).json({ error: 'Invalid request data', details: parseBody.error.issues});
    }

    // find out last history 
    const lastHistory = await prisma.history.findFirst({
        where: { inventoryId: id },
        orderBy: { createdAt: 'desc' },
    })


    // calculate the new quantity
    let newQuantity = inventory.quantity;
    const { quantity, actionType } = parseBody.data;
    if(actionType === 'In') {
        newQuantity += quantity;
    } else if(actionType === 'Out') {
        newQuantity -= quantity;  
        if(newQuantity < 0) {
            return res.status(400).json({ error: 'Insufficient inventory for this operation' });
        }
    } else {
        return res.status(400).json({ error: 'Invalid action type' });
    }


    // Update inventory

    const updatedInventory = await prisma.inventory.update({
        where: { id },
        data: { 
          quantity: newQuantity,
          histories: {
            create: {
              actionType, 
              quantityChanged: quantity,
              lastQuantity: lastHistory?.newQuantity || 0,
              newQuantity: newQuantity, 
        
        },
      },
    },
        select: { id: true, quantity: true },
    });


    return res.status(200).json(updatedInventory);
  } catch (error) { 
    console.error('Error updating inventory:', error);
    return res.status(400).json({ 
      error: 'Invalid request data', 
      details: error instanceof Error ? error.message : error 
    });
  }
}

export default updateInventory;

 

