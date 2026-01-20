import { Request, Response, NextFunction } from 'express'
import prisma from '@/prisma';
import { userCreateSchema } from '@/schemas';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import { EMAIL_SERVICE } from '@/config';


const generateVerificationCode = () => {
    // current timestamp in miliseconds
    const timestamp = new Date().getTime().toString();

    // generate 2-digit random number
    const randomNum = Math.floor(Math.random() * 90 + 10);

    // combine timstamp and random number and extract last 5 digtis
    let code = (timestamp + randomNum.toString()).slice(-5);
      
    return code;
}

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

       
        // generate verification code
         const code = generateVerificationCode();
         await prisma.verificationCode.create({
            data: {
                userId: newUser.id,
                code,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
            }
         });

        // send verification email
        
        await axios.post(`${EMAIL_SERVICE}/emails/send`, {
            recipient: newUser.email,
            subject: 'Email Verification',
            body: `Hello ${newUser.name},\n\nYour verification code is: ${code}\n\nThis code will expire in 15 minutes.\n\nThank you!`,
            source:  'user-registration'
        });


        res.status(201).json({
            message: 'User registered successfully. Please check your email for the verification code.',
            newUser
        });
        

       }catch(error){
        next(error);
    }

}

export default userRegistration;