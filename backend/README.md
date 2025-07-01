# Iwanyu E-commerce Backend

Backend API for the Iwanyu e-commerce platform built with Node.js, Express, TypeScript, and Prisma.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (for production) or SQLite (for development)

### Installation
```bash
npm install
```

### Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## 📖 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (vendor only)
- `PUT /api/products/:id` - Update product (vendor only)
- `DELETE /api/products/:id` - Delete product (vendor/admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:itemId` - Update cart item
- `DELETE /api/cart/remove/:itemId` - Remove cart item
- `DELETE /api/cart/clear` - Clear entire cart

### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get specific order
- `POST /api/checkout/create` - Create order from cart
- `POST /api/checkout/:id/payment/initialize` - Initialize payment
- `POST /api/checkout/:id/payment/verify` - Verify payment

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/products` - Get all products
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/analytics` - Get analytics data

## 🏗️ Architecture

### Technology Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL/SQLite
- **ORM**: Prisma
- **Authentication**: JWT
- **Payment**: Flutterwave
- **File Upload**: Multer
- **Validation**: express-validator

### Project Structure
```
src/
├── controllers/     # Route handlers
├── middleware/      # Custom middleware
├── routes/         # Route definitions
├── services/       # Business logic
├── types/          # TypeScript types
├── utils/          # Utility functions
└── server.ts       # Application entry point

prisma/
├── schema.prisma   # Database schema
├── migrations/     # Database migrations
└── seed.ts        # Database seeding

scripts/
├── initDatabase.ts     # Database initialization
├── checkDatabase.ts    # Health checks
└── backupDatabase.ts   # Database backup
```

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/iwanyu"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"

# Server
PORT=5001
NODE_ENV="production"

# Flutterwave
FLUTTERWAVE_PUBLIC_KEY="your-public-key"
FLUTTERWAVE_SECRET_KEY="your-secret-key"

# CORS
ALLOWED_ORIGINS="https://your-frontend-domain.com"

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR="uploads"
```

## 🚀 Deployment (Render)

### Automatic Deployment
1. Connect your GitHub repository to Render
2. Set the build command: `npm run build`
3. Set the start command: `npm start`
4. Add environment variables in Render dashboard

### Manual Deployment
```bash
# Build the application
npm run build

# Deploy to Render
# (Follow Render's deployment guide)
```

### Database Migration on Deploy
The build process automatically runs:
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations

## 📊 Monitoring

### Health Check
```bash
GET /api/health
```

### Database Status
```bash
npm run db:check
```

### Database Monitoring
```bash
npm run db:monitor
```

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **Input Validation**: Request validation
- **JWT Authentication**: Secure authentication
- **Password Hashing**: bcrypt password hashing

## 📈 Performance

- **Database Connection Pooling**
- **Response Compression**
- **Request Logging**
- **Error Handling**
- **Graceful Shutdown**

## 🧪 Testing

```bash
npm test
```

## 📝 License

MIT License - see LICENSE file for details
