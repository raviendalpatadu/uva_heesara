# Custom Domain Setup - UVA HEESARA

## ✅ Changes Made for Custom Domain

### Domain: `https://uvaheesara.uvaarchery.lk`

### 1. **Vite Configuration Updates**
- **File**: `vite.config.ts`
- **Change**: Updated `base` from `/uva_heesara/` to `/` (root path for custom domain)

### 2. **CNAME File**
- **File**: `public/CNAME`
- **Content**: `uvaheesara.uvaarchery.lk`
- **Purpose**: Tells GitHub Pages about your custom domain

### 3. **Configuration Templates**
- **File**: `public/config.json.template`
- **Updated**: `allowedOrigins` to include only your custom domain
- **File**: `.env.example`
- **Updated**: Example domain references

### 4. **Documentation Updates**
- **Files**: `README.md`, `DEPLOYMENT.md`
- **Updated**: All references from generic GitHub Pages URLs to your custom domain

### 5. **Security Configuration**
- **Runtime config**: Now recognizes your custom domain as an allowed origin
- **CORS handling**: Updated to work with the new domain

## 🔧 GitHub Repository Settings Required

### Domain Configuration
1. Go to your GitHub repository → **Settings** → **Pages**
2. Under "Custom domain", enter: `uvaheesara.uvaarchery.lk`
3. Check "Enforce HTTPS" (recommended)

### DNS Configuration (Your Domain Provider)
Make sure your DNS records point to GitHub Pages:
```
CNAME record: uvaheesara.uvaarchery.lk → yourusername.github.io
```

## 🚀 Deployment Notes

- **Build Path**: Now uses root path `/` instead of `/uva_heesara/`
- **CNAME File**: Automatically included in build output
- **Environment Variables**: No longer needed for production (uses runtime config)
- **Security**: Origin validation updated for custom domain

## 🔍 Testing

After deployment, your dashboard will be available at:
**https://uvaheesara.uvaarchery.lk**

The application will:
1. Load configuration from localStorage (if previously saved)
2. Prompt for Google Apps Script URL if no config found
3. Validate requests against the custom domain origin

## 📋 Verification Checklist

- [ ] GitHub Pages custom domain configured
- [ ] DNS CNAME record pointing to GitHub Pages
- [ ] HTTPS certificate issued (may take a few minutes)
- [ ] Application loads at custom domain
- [ ] API requests work correctly
- [ ] Configuration system functions properly
