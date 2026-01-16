import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import axios from 'axios'
import fs from 'fs'
import path from 'path'

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


// TODO: Au