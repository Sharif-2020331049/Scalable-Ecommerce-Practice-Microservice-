import { Express, Request, Response, NextFunction } from "express";
import { userCreateSchema } from "@/schemas";
import prisma from "@/prisma";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const parsedBody = userCreateSchema.safeParse(req.body);

    if(!parsedBody.success) {
      return res.status(400).json({ error: 'Invalid request data', details: parsedBody.error.message });
    }

    const { authUserId, name, email, address, phone } = parsedBody.data;

    // check if the authUserId already exists
    const existingUser = await prisma.user.findUnique({
      where: { authUserId },
    });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this authUserId already exists' });
    }

    // Create a new user in the database
    const newUser = await prisma.user.create({
      data: parsedBody.data,
    }); 
    
    res.status(201).json(newUser);
    } catch (error) {   
    next(error);
  }
};

export default createUser;


