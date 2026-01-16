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


// Authentication/Authorization middleware
const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // TODO: Implement proper authentication (JWT, API key, etc.)
    // For now, this is a placeholder that allows all requests
    const authHeader = req.headers.authorization
    
    // Example: Basic auth check (uncomment and implement as needed)
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //     return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' })
    // }
    
    // Validate token here
    // const token = authHeader.split(' ')[1]
    // try {
    //     // Verify token logic
    //     next()
    // } catch (error) {
    //     return res.status(401).json({ error: 'Unauthorized: Invalid token' })
    // }
    
    next()
}

// Load service configuration
const configPath = path.join(__dirname, 'config.json')
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy', service: 'API Gateway' })
})

// Dynamic route registration based on config
Object.entries(config.services).forEach(([serviceName, serviceConfig]: [string, any]) => {
    const serviceUrl = serviceConfig.url
    const routes = serviceConfig.routes

    routes.forEach((route: any) => {
        const routePath = route.path
        const methods = Array.isArray(route.method) ? route.method : [route.method]

        methods.forEach((method: string) => {
            const httpMethod = method.toLowerCase()
            
            // Register route with authentication middleware
            ;(app as any)[httpMethod](`/api${routePath}`, authMiddleware, async (req: express.Request, res: express.Response) => {
                try {
                    // Build target URL
                    const targetPath = req.path.replace('/api', '')
                    const targetUrl = `${serviceUrl}${targetPath}`
                    
                    // Forward request to the target service
                    const response = await axios({
                        method: httpMethod,
                        url: targetUrl,
                        data: req.body,
                        params: req.query,
                        headers: {
                            'Content-Type': 'application/json',
                            ...req.headers
                        }
                    })

                    // Return the response from the service
                    res.status(response.status).json(response.data)
                } catch (error: any) {
                    console.error(`Error proxying request to ${serviceName}:`, error.message)
                    
                    if (error.response) {
                        // Forward error response from service
                        res.status(error.response.status).json(error.response.data)
                    } else if (error.request) {
                        // Service didn't respond
                        res.status(503).json({ error: 'Service unavailable', service: serviceName })
                    } else {
                        // Other errors
                        res.status(500).json({ error: 'Internal server error' })
                    }
                }
            })
        })
    })
})

// 404 handler
app.use((req, res, _next) => {
    res.status(404).json({ error: 'Not Found', path: req.path })
})

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Internal Server Error' })
})

// Start server
const PORT = process.env.PORT || 4000
const serviceName = process.env.SERVICE_NAME || 'API-Gateway'

app.listen(PORT, () => {
    console.log(`${serviceName} is running on port ${PORT}`)
    console.log(`Registered routes from ${Object.keys(config.services).length} services`)
})