import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config({
    path: "./.env"
});


export const REDIS_PORT = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;
export const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
export const CACHE_TTL = process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 60; // default to 60 seconds
export const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:4002';

