import { Request, Response, NextFunction } from 'express'
import prisma from '@/prisma';
import { userLoginSchema } from '@/schemas';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginAttempt } from '../../generated/prisma/enums';


type LoginHistory = {
    userId: string,
    ipAddress: string | undefined,
    userAgent: string | undefined,
    attempt: LoginAttempt,
}

const createLoginHistory = async (info: LoginHistory)=>{
    await prisma.loginHistory.create({
        data: {
            userId: info.userId,
            ipAddress: info.ipAddress || '',
            userAgent: info.userAgent || '',
            attempt: info.attempt,
        }
    });

}

const userLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
)=>{    
    try{

        const ipAddress = req.headers['x-forwarded-for'] as string || req.ip ||  '';
        const  userAgent = req.headers['user-agent'] || '';


        // validate request body 
        const parseBody = userLoginSchema.safeParse(req.body);

        if(!parseBody.success){
            return  res.status(400).json({ error: 'Invalid request data', details: parseBody.error.message });
        }

        // check user exists
        const { email, password } = parseBody.data;

        const user = await prisma.user.findUnique({ 
            where: { email } 
        });
        if(!user){
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            await createLoginHistory({
                userId: user.id,
                ipAddress,
                userAgent,
                attempt: LoginAttempt.FAILURE,
            });

            return res.status(401).json({ message: 'Invalid email or password' });
        }


        // check if user is verfied
        if(!user.verified){
            await createLoginHistory({
                userId: user.id,
                ipAddress,
                userAgent,
                attempt: LoginAttempt.FAILURE,
            });

            return res.status(403).json({ message: 'User is not verified' });
        }

        // check if user is active
        if(user.status !== 'ACTIVE'){
            await createLoginHistory({
                userId: user.id,
                ipAddress,
                userAgent,
                attempt: LoginAttempt.FAILURE,
            });

            return res.status(403).json({ message: `Your account is ${user.status.toLowerCase()}` });
        }


        // generate JWT token
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email, name: user.name, role: user.role }, 
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
        );


        await createLoginHistory({
                userId: user.id,
                ipAddress,
                userAgent,
                attempt: LoginAttempt.SUCCESS,
            });


        res.status(200).json({ 
            accessToken,
        });




    }catch(err){
        next(err);
    }
};

export default userLogin;