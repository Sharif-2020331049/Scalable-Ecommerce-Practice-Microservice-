import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import { getEmails, sendEmail } from './controllers'




dotenv.config()

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(morgan('dev'))

app.get('/health', (_req, res) => {
  res.status(200).send('Email Service is healthy')
})



// app.use((req: Request, res: Response, next: NextFunction) => {
//     const allowedOrigins = ['http://localhost:8081', 'http://127.0.0.1:8081'];
//     const origin = req.headers.origin || '';
//     if (allowedOrigins.includes(origin)) {
//         res.setHeader('Access-Control-Allow-Origin', origin);
//         next();
//     }else {
//         res.status(403).json({ message: 'Forbidden' });
//     }

// });

// routes
app.post('/emails/send', sendEmail);
app.get('/emails', getEmails); // just for testing purpose


// 404 handler
app.use((req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({ error: 'Not Found' })
})  
 
// error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error occurred:', err.message)
  console.error(err.stack)
  res.status(500).json({ error: 'Internal Server Error', message: err.message })
})


const PORT = process.env.PORT || 4004
const serviceName = process.env.SERVICE_NAME || 'Email-Service'



app.listen(PORT, () => {
  console.log(`${serviceName} is running on port ${PORT}`)
})  