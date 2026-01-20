import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { accessTokenSchema, EmailVerificationSchema } from "@/schemas";
import prisma from "@/prisma";
import axios from "axios";
import { EMAIL_SERVICE } from "@/config";



const verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
)=>{
    try{

        // validate request body
        const parseBody = EmailVerificationSchema.safeParse(req.body);

        if(!parseBody.success){
            return res.status(400).json({ error: 'Invalid request data', details: parseBody.error.message });
        }

        // check if the user with the email exists
        const { email, code } = parseBody.data;
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if(!user){
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        // find the verification code
        const verificationRecord = await prisma.verificationCode.findFirst({
            where: {
                userId: user.id,
                code,
            }
        });


        if(!verificationRecord){
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // If the code has expired
        if(verificationRecord.expiresAt < new Date()){
            return res.status(400).json({ message: 'Verification code has expired' });
        }


        // update user status to verified
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                verified: true,
                status: 'ACTIVE',
            }
        });


        // update verification code status to used
        await prisma.verificationCode.update({
            where: {
                id: verificationRecord.id
            },
            data: {
                status: "VERIFIED"
            }
        });

        // send success email
        await axios.post(`${EMAIL_SERVICE}/emails/send`, {
            recipient: user.email,
            subject: 'Email Verified Successfully',
            body: `Hello ${user.name}, your email has been successfully verified. You can now log in to your account.`,
            source: 'email-verification'
        });


        res.status(200).json({ message: 'Email verified successfully' });


    }catch(err){
        next(err);
    }
}

export default verifyEmail;