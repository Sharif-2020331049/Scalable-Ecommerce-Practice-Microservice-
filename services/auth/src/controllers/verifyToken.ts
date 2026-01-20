import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { accessTokenSchema } from "@/schemas";
import prisma from '@/prisma';



const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
       // validate request body
        const parseBody = accessTokenSchema.safeParse(req.body);

        if(!parseBody.success) {
            return res.status(400).json({ error: 'Invalid request data', details: parseBody.error.message });
        }

        const { accessToken } = parseBody.data;

        // verify token
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET as string);

        // const userId = (decoded as { userId: string }).userId;

        const user = await prisma.user.findUnique({
            where: { id: (decoded as any).userId },

            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            }
        });

        if(!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        return res.status(200).json({message: "Authorized", user });


    } catch (error) {
        next(error);
    }
}

export default verifyToken;