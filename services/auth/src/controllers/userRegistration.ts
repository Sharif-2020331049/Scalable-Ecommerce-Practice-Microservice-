import { Request, Response, NextFunction } from 'express'
import prisma from '@/prisma';
import { userCreateSchema } from '@/schemas';
import bcrypt from 'bcryptjs';
import axios from 'axios';


const userRegistration = async (
    req: Request,
    res: Response,
    next: NextFunction
)=>{

    try{

        // validate request body
        const parseBody = userCreateSchema.safeParse(req.body);

        if(!parseBody.success){
            return res.status(400).json({ error: 'Invalid request data', details: parseBody.error.message });
        }

        const {email, name, password} = parseBody.data;

        // check user already exists
         const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
         })

         if(existingUser){
            return res.status(409).json({ message: 'User with this email already exists' });
         }

         // hash password
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password, salt);

        // create user
        const newUser = await prisma.user.create({
            data: {
                ...parseBody.data,
                password: hashedPassword
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                verified: true,
            }
        })

        console.log("User created", newUser);


        // create the user profile by calling user service
        await axios.post(`{USER_SERVICE}/users`, {
            authUserId: newUser.id,
            name: newUser.name,
            email: newUser.email,
        });

       
        // TODO: generate verification code
        // TODO: send verification email
        
        

        res.status(201).json(newUser);
        

       }catch(error){
        next(error);
    }

}

export default userRegistration;