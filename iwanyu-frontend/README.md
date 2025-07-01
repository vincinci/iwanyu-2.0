# Iwanyu Frontend

A modern React ecommerce application built with TypeScript and Tailwind CSS, optimized for deployment on Vercel.

## Features

- 🛍️ Product catalog with search and filtering
- 🛒 Shopping cart functionality
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS
- 📊 Admin dashboard for product management
- 💳 Payment integration ready
- 🔐 User authentication system

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **Context API** for state management

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see `/backend` directory)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your backend API URL:
   ```
   REACT_APP_API_URL=http://localhost:5001/api
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   The app will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Deployment on Vercel

### Quick Deploy

1. **Connect your repository to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository
   - Set the root directory to `iwanyu-frontend`

2. **Configure environment variables in Vercel:**
   ```
   REACT_APP_API_URL=https://your-backend-app.onrender.com/api
   ```

3. **Deploy:**
   - Vercel will automatically build and deploy your app
   - Your app will be available at `https://your-app.vercel.app`

### Manual Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Project Structure

```
iwanyu-frontend/
├── public/          # Static assets
├── src/
│   ├── components/  # Reusable React components
│   ├── pages/       # Page components
│   ├── services/    # API services
│   ├── context/     # React Context providers
│   ├── hooks/       # Custom React hooks
│   ├── types/       # TypeScript type definitions
│   └── utils/       # Utility functions
├── vercel.json      # Vercel configuration
└── package.json
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5001/api` |

## Configuration

### Vercel Configuration

The `vercel.json` file configures:
- Static file caching
- SPA routing fallback
- Environment variable mapping

### Tailwind CSS

Tailwind is configured in `tailwind.config.js` with:
- Custom color scheme
- Responsive breakpoints
- Component utilities

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
