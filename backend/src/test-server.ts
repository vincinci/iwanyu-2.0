import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Basic API info
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Iwanyu E-commerce API',
    version: '1.0.0',
    docs: '/api/docs'
  });
});

// Mock auth endpoints for testing
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Mock login endpoint',
    data: {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: req.body.email || 'test@example.com',
        role: 'CUSTOMER'
      }
    }
  });
});

app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    message: 'Mock products endpoint',
    data: {
      products: [
        {
          id: '1',
          name: 'Test Product',
          basePrice: 1000,
          images: [{ url: '/placeholder-product.jpg', altText: 'Test Product' }]
        }
      ],
      total: 1,
      page: 1,
      totalPages: 1
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📚 API available at http://localhost:${PORT}/api`);
  console.log(`❤️  Health check at http://localhost:${PORT}/api/health`);
});
