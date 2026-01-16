import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import { createProduct } from './controllers/index'
import { getProductDetails } from './controllers/index'
import { getProducts } from './controllers/index'

dotenv.config()

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(morgan('dev'))

app.get('/health', (_req, res) => {
  res.status(200).send('Product Service is healthy')
})


const PORT = process.env.PORT || 4001
const serviceName = process.env.SERVICE_NAME || 'Product-Service'


app.use((req: Request, res: Response, next: NextFunction) => {
    const allowedOrigins = ['http://localhost:8081', 'http://127.0.0.1:8081'];
    const origin = req.headers.origin || '';
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        next();
    }else {
        res.status(403).json({ message: 'Forbidden' });
    }


});

// api endpoints
app.post('/products', createProduct)
app.get('/product/:id', getProductDetails)
app.get('/products', getProducts)


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


app.listen(PORT, () => {
  console.log(`${serviceName} is running on port ${PORT}`)
})  