import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { EmailCreateSchema } from "../schemas";
import { defaultSender, transporter } from "@/config";

const sendEmail = async (req: Request, res: Response, next: NextFunction) => {

    try {
            
        // validate request body
        const parseBody = EmailCreateSchema.safeParse(req.body);
        if(!parseBody.success){
            return res.status(400).json({ error: 'Invalid request data', details: parseBody.error.message });
        }


        // create a mail option
        const { recipient, subject, body, source, sender } = parseBody.data;
 
        const from = sender || defaultSender;
        const mailOptions = {
            from,
            to: recipient,
            subject: subject,
            text: body,
        };

        // send email using transporter
        const { rejected } = await transporter.sendMail(mailOptions);
        if(rejected.length > 0){
            console.log('Email rejected', rejected);
            return res.status(500).json({ error: 'Failed to send email' });
        }


        await prisma.email.create({
             data: {
                sender: from,
                recipient,
                subject,
                body,
                source,
               
             }
        });

        res.status(200).json({ message: 'Email sent successfully' });



    } catch (error) {
        next(error);
    }
}


export default sendEmail;