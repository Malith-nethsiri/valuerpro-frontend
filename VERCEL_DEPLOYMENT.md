# Vercel Deployment Guide

## 🚀 Quick Setup

### 1. Link GitHub Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import from GitHub: `https://github.com/Malith-nethsiri/valuerpro-frontend`
4. Configure settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2. Environment Variables

Set these in your Vercel project settings:

```bash
VITE_API_URL=https://your-backend-url.railway.app
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_PADDLE_VENDOR_ID=your_paddle_vendor_id
VITE_PADDLE_ENVIRONMENT=sandbox
```

### 3. Automatic Deployment

Once linked, every push to `main` branch will trigger automatic deployment:

```bash
# Make changes to your code
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

**Vercel will automatically:**
1. Detect the push to GitHub
2. Pull the latest code
3. Run `npm install`
4. Run `npm run build`
5. Deploy to your live URL

### 4. Domain Configuration

1. Go to Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

### 5. Build Logs

Monitor deployment status at:
- Vercel Dashboard → Your Project → Deployments
- Real-time build logs available during deployment

## 🔧 Troubleshooting

### Common Issues:

1. **Build Failures**: Check environment variables are set correctly
2. **API Errors**: Ensure backend URL is accessible and CORS is configured
3. **Missing Dependencies**: Check `package.json` is committed to repository

### Build Commands:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## 📊 Deployment Status

- ✅ Repository linked to Vercel
- ✅ Auto-deployment configured
- ✅ Build configuration ready
- ✅ Environment variables template provided

---

**Next Steps**: Set up environment variables in Vercel dashboard and your frontend will be live!
