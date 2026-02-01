import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';

import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet());

// Parse CORS origins from .env (supports comma-separated values)
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // Default 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5000'), // Default 5000 requests
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use('/api/', limiter);

// Enable CORS for uploads directory with proper headers
app.use('/uploads', cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
}), express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, path) => {
    // Set CORS headers for all files
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({
    message: 'Shiv Furniture Budget Accounting System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      contacts: '/api/contacts',
      products: '/api/products',
      analyticalAccounts: '/api/analytical-accounts',
      budgets: '/api/budgets',
      autoAnalyticalModels: '/api/auto-analytical-models',
      purchaseOrders: '/api/purchase-orders',
      salesOrders: '/api/sales-orders',
      invoices: '/api/invoices',
      bills: '/api/bills',
      payments: '/api/payments',
      reports: '/api/reports',
      portal: '/api/portal'
    }
  });
});

app.use(notFound);

app.use(errorHandler);

export default app;
