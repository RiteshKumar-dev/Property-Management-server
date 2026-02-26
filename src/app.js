import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import routes from './routes/index.js';

const app = express();

/* -------------------------- Global Middleware -------------------------- */

// Security headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: '*', // change in production
    credentials: true,
  }),
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger (dev only recommended)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

/* ------------------------------ Routes ---------------------------------- */

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running...',
  });
});

// API routes
app.use('/api', routes);

/* ------------------------- 404 Handler ---------------------------------- */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route Not Found',
  });
});

/* ----------------------- Global Error Handler --------------------------- */
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
