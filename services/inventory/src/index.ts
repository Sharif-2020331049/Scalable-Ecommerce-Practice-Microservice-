import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import { createInventory, getInventoryById, getInventoryDetails, updateInventory } from './controller';

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

app.get('/health', (_req, res) => {
  res.status(200).send('Inventory Service is healthy')
})

const PORT = process.env.PORT || 4002
const serviceName = process.env.SERVICE_NAME || 'Inventory-Service'



//  Api endpoints

app.get('/inventories/:id/details', getInventoryDetails);
app.get('/inventories/:id', getInventoryById);

// update
app.put('/inventories/:id', updateInventory);  

// create
app.post('/inventories', createInventory);



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