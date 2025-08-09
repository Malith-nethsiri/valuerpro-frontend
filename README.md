# ValuerPro Frontend

Professional real estate valuation SaaS platform built with React, TypeScript, and Tailwind CSS.

## 🚀 Live Demo

This project automatically deploys to Vercel when changes are pushed to the main branch.

**Deployment URL**: [Your Vercel URL]

## ✨ Features

- **Modern React Architecture**: Built with Vite, TypeScript, and Tailwind CSS
- **Authentication**: JWT-based auth with role-based access control
- **Report Management**: Create, edit, and manage valuation reports
- **AI-Powered OCR**: Extract data from documents using AI
- **Google Maps Integration**: Interactive property location mapping
- **File Upload**: Drag-and-drop file upload with OCR processing
- **Subscription Management**: Paddle payment integration
- **Admin Dashboard**: User and system management
- **Responsive Design**: Mobile-first, professional UI

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **Google Maps API** for mapping
- **Paddle** for payments

## 🚀 Deployment

This project is configured for automatic deployment to Vercel:

1. **Connect to Vercel**: Link this GitHub repository to your Vercel project
2. **Environment Variables**: Configure required environment variables in Vercel dashboard
3. **Automatic Deployment**: Every push to `main` branch triggers a new deployment

### Environment Variables

Create these environment variables in your Vercel dashboard:

```
VITE_API_BASE_URL=your-backend-api-url
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
VITE_PADDLE_VENDOR_ID=your-paddle-vendor-id
```

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── contexts/      # React contexts
├── services/      # API and external services
├── types/         # TypeScript type definitions
└── styles/        # Global styles
```

## 🔗 Related Repositories

- **Backend**: [valuerpro-backend](https://github.com/Malith-nethsiri/valuerpro-backend)

## 📄 License

This project is proprietary software for ValuerPro SaaS platform.

---

**Last Updated**: August 9, 2025
**Auto-deployment enabled** ✅
