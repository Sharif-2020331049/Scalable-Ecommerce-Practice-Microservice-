import express from 'express'
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

// api endpoints

app.get('/products/:id', getProductDetails)
app.get('/products', getProducts)
app.post('/products', createProduct)


// 404 handler
app.use((req, res, _next) => {
  res.status(404).send({ error: 'Not Found' })
})  
 
// error handler
app.use((err: Error, _req, res, _next) => {
  console.error(err.stack)
  res.status(500).send({ error: 'Internal Server Error' })
})


app.listen(PORT, () => {
  console.log(`${serviceName} is running on port ${PORT}`)
})  