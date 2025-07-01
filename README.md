# Iwanyu - Multi-Vendor E-Commerce Platform

**🔄 This project has been reorganized for modern cloud deployment!**

Iwanyu is a comprehensive, production-ready multi-vendor e-commerce platform built for Rwanda, featuring customer shopping, vendor management, and admin oversight with secure payments through Flutterwave.

## 📁 Clean Project Structure

✨ **Successfully reorganized and cleaned!**

```
iwanyu-2.0/
├── backend/              # Express.js API server → Deploy to Render
├── iwanyu-frontend/      # React.js web app → Deploy to Vercel
├── archive/              # Old documentation files (can be deleted)
├── DEPLOYMENT_GUIDE.md   # Complete deployment instructions
├── REORGANIZATION_SUMMARY.md  # What was accomplished
└── README.md            # This file
```

**📚 Quick Start:**
- **Backend:** See `backend/README.md`
- **Frontend:** See `iwanyu-frontend/README.md`
- **Deployment:** See `DEPLOYMENT_GUIDE.md`

## 🚀 Features

### Customer Features
- **User Registration & Authentication** - Secure JWT-based authentication
- **Product Browsing** - Search, filter, and browse products by category
- **Shopping Cart** - Add products to cart with quantity management
- **Secure Checkout** - Flutterwave payment integration (RWF currency)
- **Order Tracking** - Real-time order status updates
- **User Profile** - Manage personal information and addresses
- **Wishlist** - Save favorite products for later

### Vendor Features
- **Vendor Registration** - Apply to become a vendor with document verification
- **Product Management** - Add, edit, and manage product listings
- **Inventory Management** - Track stock levels and variants
- **Bulk Upload** - CSV-based bulk product uploads
- **Order Management** - Process and fulfill customer orders
- **Analytics Dashboard** - Sales performance and analytics
- **Payout Integration** - Automated payouts via Flutterwave

### Admin Features
- **Vendor Approval** - Review and approve vendor applications
- **Product Moderation** - Approve/reject product listings
- **User Management** - Manage customer and vendor accounts
- **Analytics Dashboard** - Platform-wide analytics and insights
- **Content Management** - Manage categories, banners, and site content

## 🛠 Tech Stack

### Backend
- **Node.js** with **Express.js** framework
- **TypeScript** for type safety
- **PostgreSQL** database (hosted on NeonDB)
- **Prisma ORM** for database management
- **JWT** for authentication
- **Flutterwave API** for payments and payouts
- **Multer** for file uploads
- **UUID** for unique identifiers

### Frontend
- **React 19** with **TypeScript**
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** with **Zod** validation
- **Axios** for API calls
- **Lucide React** for icons

## 📁 Project Structure

```
iwanyu-2.0/
├── src/                          # Backend source code
│   ├── controllers/              # Route controllers
│   ├── middleware/               # Express middleware
│   ├── routes/                   # API routes
│   ├── services/                 # Business logic services
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions
│   └── server.ts                 # Express server setup
├── prisma/                       # Database schema and migrations
│   ├── schema.prisma            # Database schema
│   └── seed.ts                  # Database seeding script
├── client/backend/frontend/      # React frontend application
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── context/             # React context providers
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Page components
│   │   ├── services/            # API service layer
│   │   ├── types/               # TypeScript types
│   │   └── utils/               # Utility functions
│   ├── public/                  # Static assets
│   └── package.json             # Frontend dependencies
├── uploads/                     # File upload directory
│   ├── products/                # Product images
│   └── documents/               # Vendor documents
├── .env                         # Environment variables
├── package.json                 # Backend dependencies
└── README.md                    # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Backend Setup

1. **Clone and navigate to the project:**
   ```bash
   cd "iwanyu 2.0"
   ```

2. **Install backend dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy `.env.example` to `.env` and configure:
   ```env
   DATABASE_URL="your_postgresql_connection_string"
   JWT_SECRET="your_jwt_secret"
   FLUTTERWAVE_PUBLIC_KEY="your_flutterwave_public_key"
   FLUTTERWAVE_SECRET_KEY="your_flutterwave_secret_key"
   FLUTTERWAVE_ENCRYPTION_KEY="your_flutterwave_encryption_key"
   ```

4. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd "client/backend/frontend"
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Set up frontend environment:**
   Create `.env` file in frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
   ```

4. **Start the frontend server:**
   ```bash
   npm start
   ```
   Frontend will run on `http://localhost:3000`

### Using VS Code Tasks

You can use the predefined VS Code tasks for development:

- **Ctrl+Shift+P** → "Tasks: Run Task"
- Select "Start Full Stack" to run both backend and frontend simultaneously
- Or run individual tasks: "Start Backend Server" or "Start Frontend Server"

## 🔧 Development

### Database Management

- **Reset database:** `npx prisma migrate reset`
- **Apply schema changes:** `npx prisma db push`
- **Generate Prisma client:** `npx prisma generate`
- **Seed database:** `npx prisma db seed`
- **View data:** `npx prisma studio`

### API Documentation

The backend API follows RESTful conventions:

#### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

#### Product Endpoints
- `GET /api/products` - List products (with filtering/pagination)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (vendor only)
- `PUT /api/products/:id` - Update product (vendor only)
- `DELETE /api/products/:id` - Delete product (vendor only)

#### Order Endpoints
- `GET /api/orders` - List user orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status

#### Payment Endpoints
- `POST /api/payments/initialize` - Initialize Flutterwave payment
- `POST /api/payments/verify` - Verify payment status

### File Uploads

- **Product Images:** Upload to `/uploads/products/`
- **Vendor Documents:** Upload to `/uploads/documents/`
- **Bulk Product CSV:** Use `/api/upload/bulk-products` endpoint

## 🚀 Deployment

### Backend Deployment

1. **Build the backend:**
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Deploy to your hosting platform** (Heroku, Railway, DigitalOcean, etc.)

### Frontend Deployment

1. **Build the frontend:**
   ```bash
   cd "client/backend/frontend"
   npm run build
   ```

2. **Deploy the `build` folder** to a static hosting service (Netlify, Vercel, etc.)

### Database Setup (Production)

- Use NeonDB or another PostgreSQL hosting service
- Run migrations: `npx prisma migrate deploy`
- Seed initial data: `npx prisma db seed`

## 🔐 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** with bcrypt
- **Input Validation** with Zod schemas  
- **File Upload Security** with file type and size validation
- **CORS Configuration** for cross-origin requests
- **Environment Variable Protection** for sensitive data

## 💰 Payment Integration

The platform integrates with **Flutterwave** for:
- Customer payments in RWF (Rwandan Francs)
- Vendor payout management
- Transaction verification and webhook handling
- Multi-party payment splitting

## 📱 Mobile Responsive

The frontend is fully responsive and optimized for:
- Desktop computers
- Tablets  
- Mobile phones
- Progressive Web App (PWA) capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@iwanyu.com
- Documentation: See inline code comments
- Issues: Create a GitHub issue

## 🔄 Version History

- **v1.0.0** - Initial release with core e-commerce functionality
- **v1.1.0** - Added vendor management and admin dashboard
- **v1.2.0** - Flutterwave payment integration
- **v2.0.0** - Complete rewrite with TypeScript and modern stack

## 🎨 Recent UI/UX Improvements

### Header Enhancements
- **Organized Category Navigation** - Clean dropdown menu with all product categories
- **Featured Categories** - Quick access to popular categories (Shoes, Women, Electronics)
- **Wishlist Integration** - Added wishlist icon and link in header
- **Mobile-Responsive** - Improved mobile navigation with organized category sections

### Footer Enhancements
- **Payment Method Icons** - Added visual payment method indicators:
  - Visa and Mastercard
  - MTN Mobile Money and Airtel Money
  - Bank Transfer and PayPal options
- **Language Selection** - English, Kinyarwanda, and French options
- **Improved Styling** - Clean, professional footer design

### Product Card Features
- **Interactive Product Cards** - Hover effects with overlay actions
- **Add to Cart Button** - Quick add to cart functionality
- **Wishlist Heart Icon** - Save/remove from wishlist
- **Quick View** - Eye icon for product preview
- **Sale Badges** - Visual indicators for discounted items
- **Multiple Images** - Hover to see additional product images

### Enhanced Pages
- **Product Collections** - Improved grid layout with new product cards
- **Shopping Cart** - Complete cart management with quantity controls
- **Wishlist Page** - Dedicated page for saved products
- **Responsive Design** - Mobile-first approach for all devices

### Color Scheme
- **Primary Colors**: Yellow (#eab308) as accent color
- **Background**: Clean white backgrounds
- **Text**: Professional gray tones
- **Hover States**: Yellow highlights and smooth transitions
