import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { configureRoutes } from './utils'

dotenv.config()
const app = express()

// security middlewares
app.use(helmet())


// Rate limiting middleware

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    handler: (_req, res) => {
        res.status(429).json({ error: 'Too many requests, please try again later.' });
    }
})

// If I want to global apply rate limiting
// app.use(limiter);

// local middlewares of limiter
app.use('/api', limiter)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(morgan('dev'))

// TODO: Auth middleware 


// routes 
configureRoutes(app);



// health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).send({ status: 'API Gateway is healthy' });
});

// 404 handler 
app.use((req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(404).send({ error: 'Not Found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Internal Server Error' });
}); 

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});
