import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { User } from "../../generated/prisma";



// user/:id?field=id|authUserId
const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const field = Array.isArray(req.query.field) 
      ? req.query.field[0] 
      : req.query.field;

    let user: User | null = null;

    if(field === 'authUserId') {
      user = await prisma.user.findUnique({
        where: { authUserId: id },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { id },  
      });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  } 
};


export default getUserById;