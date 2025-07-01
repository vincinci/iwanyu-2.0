# Iwanyu E-Commerce Platform - Copilot Instructions

## Project Overview

This is a production-ready multi-vendor e-commerce platform called "Iwanyu" built for the Rwandan market. The platform enables customers to browse and purchase products from verified vendors, while providing comprehensive management tools for vendors and administrators.

## Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Payments**: Flutterwave API integration (RWF currency)
- **File Handling**: Multer for uploads
- **Validation**: Zod schemas

### Frontend  
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Project Structure

```
iwanyu-2.0/
├── src/                          # Backend source
│   ├── controllers/              # API controllers
│   ├── middleware/               # Express middleware
│   ├── routes/                   # API routes
│   ├── services/                 # Business logic
│   ├── types/                    # TypeScript types
│   ├── utils/                    # Utilities
│   └── server.ts                 # Main server
├── prisma/                       # Database
│   ├── schema.prisma            # Schema definition
│   └── seed.ts                  # Seed data
├── client/backend/frontend/      # React frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── context/             # React context
│   │   ├── pages/               # Page components
│   │   ├── services/            # API services
│   │   ├── types/               # TypeScript types
│   │   └── utils/               # Utilities
└── uploads/                     # File storage
```

## Key Features

### Core E-Commerce
- User registration and authentication (customers/vendors/admins)
- Product catalog with categories, search, and filtering  
- Shopping cart and checkout functionality
- Order management and tracking
- Secure payment processing via Flutterwave
- Multi-vendor marketplace capabilities

### Vendor Features
- Vendor application and verification process
- Product management (CRUD operations)
- Inventory tracking with variants
- Bulk product upload via CSV
- Sales analytics and reporting
- Automated payout system

### Admin Features
- Vendor approval workflow
- Product moderation and approval
- User management
- Platform analytics
- Content management (categories, banners)

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow consistent naming conventions (camelCase for variables, PascalCase for components)
- Use Prisma for all database operations
- Implement proper error handling with try-catch blocks
- Add JSDoc comments for complex functions

### API Conventions
- RESTful endpoints with appropriate HTTP methods
- Consistent response format with success/error status
- Proper HTTP status codes
- JWT authentication for protected routes
- Input validation using Zod schemas

### Frontend Patterns
- Functional components with React hooks
- Custom hooks for reusable logic
- Context providers for global state
- Responsive design with Tailwind CSS
- Loading states and error handling
- Form validation with React Hook Form + Zod

### Security Considerations
- Never expose sensitive environment variables to frontend
- Validate all user inputs on both client and server
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Sanitize file uploads and validate file types
- Hash passwords with bcrypt

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development|production
PORT=5000
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
FLUTTERWAVE_PUBLIC_KEY=your_public_key
FLUTTERWAVE_SECRET_KEY=your_secret_key
FLUTTERWAVE_ENCRYPTION_KEY=your_encryption_key
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
ADMIN_EMAIL=admin@iwanyu.com
ADMIN_PASSWORD=admin123456
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Iwanyu
REACT_APP_FLUTTERWAVE_PUBLIC_KEY=your_public_key
```

## Common Development Tasks

### Starting the Development Environment
1. Backend: `npm run dev` (from root directory)
2. Frontend: `npm start` (from client/backend/frontend directory)
3. Or use VS Code task: "Start Full Stack"

### Database Operations
- Reset DB: `npx prisma migrate reset`
- Apply changes: `npx prisma db push`
- Generate client: `npx prisma generate`
- Seed data: `npx prisma db seed`
- Browse data: `npx prisma studio`

### Adding New Features
1. Define database models in `prisma/schema.prisma`
2. Create TypeScript types in `src/types/`
3. Implement backend controllers and routes
4. Add validation schemas with Zod
5. Create frontend components and pages
6. Add API service methods
7. Update tests and documentation

## Testing Strategy
- Unit tests for utility functions
- Integration tests for API endpoints
- Component tests for React components
- End-to-end tests for critical user flows
- Manual testing on different devices and browsers

## Deployment Notes
- Backend can be deployed to any Node.js hosting service
- Frontend builds to static files for deployment
- Database should use PostgreSQL in production
- Configure CORS for production domains
- Set up proper logging and monitoring
- Use environment-specific configurations

## Troubleshooting

### Common Issues
- **Build errors**: Check TypeScript types and import paths
- **Database errors**: Verify DATABASE_URL and run migrations
- **Payment issues**: Check Flutterwave API keys and webhooks
- **File upload issues**: Verify upload directory permissions
- **CORS errors**: Update CORS configuration for frontend domain

### Debug Mode
- Backend: Set NODE_ENV=development for detailed error logs
- Frontend: Use React Developer Tools for component debugging
- Database: Use Prisma Studio to inspect data

## Contributing Guidelines
1. Create feature branches from main
2. Write clean, documented code
3. Test thoroughly before submitting PRs
4. Update documentation for new features
5. Follow existing code patterns and conventions

## Support and Resources
- **Documentation**: README.md and inline code comments
- **API Testing**: Use Postman or similar tools
- **Database GUI**: Prisma Studio or pgAdmin
- **Error Monitoring**: Consider Sentry for production
- **Performance**: Monitor with tools like New Relic or DataDog
