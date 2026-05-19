import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import { checkout, getOrderById, getOrders } from './controller'
import prisma from './prisma'

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

app.get('/health', (_req, res) => {
  res.status(200).send('Order Service is healthy')
})

const PORT = process.env.PORT || 4007
const serviceName = process.env.SERVICE_NAME || 'Order-Service'

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

//  routes
app.post('/orders/checkout', checkout);
app.get('/orders/:id', getOrderById);
app.get('/orders', getOrders);


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


const server = app.listen(PORT, () => {
  console.log(`${serviceName} is running on port ${PORT}`)
})

// server.on('error', (err) => {
//   console.error('Server error:', err)
// })

// server.on('close', () => {
//   console.error('HTTP server closed')
// })

// const shutdown = async (signal: string) => {
//   console.log(`${signal} received. Shutting down ${serviceName}...`)

//   server.close(async () => {
//     try {
//       await prisma.$disconnect()
//       console.log('Database disconnected')
//     } finally {
//       process.exit(0)
//     }
//   })
// }

// process.on('SIGINT', () => {
//   void shutdown('SIGINT')
// })

// process.on('SIGTERM', () => {
//   void shutdown('SIGTERM')
// })