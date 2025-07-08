# Secure Production Deployment Guide
## UVA Heesara Tournament Dashboard

This guide provides step-by-step instructions for securely deploying the UVA Heesara Tournament Dashboard to production on `uvaheesara.uvaarchery.lk`.

## ⚡ **New Simplified Configuration**

**No Manual Configuration Required!** The application now automatically loads configuration from:
1. Environment variables (GitHub Secrets in production)
2. Local storage (fallback)
3. Clear error messages if configuration is missing

**No more configuration dialogs** - just set your GitHub Secrets and deploy!

## 🔒 Security Checklist

### Before Deployment
- [ ] Remove all test/development credentials from codebase
- [ ] Ensure `.env.production` is not committed to version control
- [ ] Configure proper Asgardeo production application
- [ ] Set up Google Apps Script with proper permissions
- [ ] Configure domain DNS settings
- [ ] Enable HTTPS/SSL certificate

## 🚀 Deployment Options

### Option 1: GitHub Pages (Recommended for Static Sites)

1. **Prepare Repository**
   ```bash
   # Ensure all sensitive data is removed
   git status
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Configure GitHub Pages**
   - Go to your GitHub repository settings
   - Navigate to "Pages" section
   - Select source: "Deploy from a branch"
   - Choose branch: `main` and folder: `/dist`
   - Custom domain: `uvaheesara.uvaarchery.lk`

3. **Build and Deploy**
   ```bash
   npm run build
   # Commit the dist folder if using GitHub Pages
   git add dist/
   git commit -m "Production build"
   git push origin main
   ```

### Option 2: Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Configure Domain**
   - Add custom domain in Vercel dashboard
   - Point DNS to Vercel

### Option 3: Netlify Deployment

1. **Build Project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag and drop `dist` folder to Netlify dashboard
   - Or connect GitHub repository

3. **Configure Domain**
   - Add custom domain in Netlify dashboard
   - Configure DNS settings

## 🔧 Environment Configuration

### 1. Asgardeo Setup

1. **Create Production Application**
   - Go to [Asgardeo Console](https://console.asgardeo.io/)
   - Create new application for production
   - Configure redirect URLs:
     - Sign-in: `https://uvaheesara.uvaarchery.lk/admin`
     - Sign-out: `https://uvaheesara.uvaarchery.lk`

2. **Security Settings**
   - Enable PKCE (already configured)
   - Set appropriate token lifetimes
   - Configure allowed origins: `https://uvaheesara.uvaarchery.lk`

### 2. Google Apps Script Configuration

1. **Create Production Script**
   - Copy your development script
   - Update sharing permissions for production
   - Get the new script ID

2. **API Security**
   - Restrict API access to your domain
   - Consider implementing API key validation
   - Set up proper error handling

### 3. Environment Variables

Create production environment variables on your hosting platform:

```bash
VITE_API_BASE_URL=https://script.google.com/macros/s/YOUR_PRODUCTION_SCRIPT_ID/exec
VITE_ASGARDEO_CLIENT_ID=your-production-client-id
VITE_ASGARDEO_BASE_URL=https://api.asgardeo.io/t/your-production-org
VITE_ASGARDEO_REDIRECT_URL=https://uvaheesara.uvaarchery.lk
VITE_PRODUCTION_DOMAIN=uvaheesara.uvaarchery.lk
VITE_ENVIRONMENT=production
VITE_ALLOWED_ORIGINS=https://uvaheesara.uvaarchery.lk
```

## 🌐 DNS Configuration

### DNS Records for `uvaheesara.uvaarchery.lk`

1. **For GitHub Pages:**
   ```
   Type: CNAME
   Name: uvaheesara
   Value: yourusername.github.io
   ```

2. **For Vercel:**
   ```
   Type: CNAME
   Name: uvaheesara
   Value: cname.vercel-dns.com
   ```

3. **For Netlify:**
   ```
   Type: CNAME
   Name: uvaheesara
   Value: your-site-name.netlify.app
   ```

## 🔐 Security Best Practices

### 1. Credential Management
- Never commit real credentials to version control
- Use environment variables for all sensitive data
- Rotate credentials regularly
- Use different credentials for development and production

### 2. Access Control
- Limit Asgardeo application access to specific users/groups
- Implement proper role-based access control
- Monitor authentication logs

### 3. Data Protection
- Enable HTTPS/SSL (usually automatic with modern hosting)
- Implement Content Security Policy (CSP) headers
- Regular security audits

### 4. Monitoring
- Set up error tracking (e.g., Sentry)
- Monitor API usage and performance
- Implement logging for security events

## 📦 Build Process

### Production Build Commands
```bash
# Clean previous builds
rm -rf dist/

# Install dependencies
npm ci --production

# Build for production
npm run build

# Test the build locally (optional)
npm run preview
```

### Build Optimization
- Code splitting is already configured
- Assets are optimized automatically
- Production builds are minified

## 🚨 Troubleshooting

### Common Issues

1. **Authentication Redirect Loops**
   - Check Asgardeo redirect URLs
   - Verify domain configuration
   - Check browser console for errors

2. **API Errors**
   - Verify Google Apps Script permissions
   - Check CORS settings
   - Validate API endpoint URLs

3. **Domain Issues**
   - DNS propagation can take 24-48 hours
   - Check SSL certificate status
   - Verify CNAME configuration

### Error Monitoring
- Check browser console for JavaScript errors
- Monitor network requests for API failures
- Review hosting platform logs

## 📋 Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test authentication flow
- [ ] Confirm data loading from API
- [ ] Test all filter functionality
- [ ] Verify mobile responsiveness
- [ ] Check SSL certificate
- [ ] Test all admin functions
- [ ] Verify proper logout functionality

## 🔄 Maintenance

### Regular Tasks
- Monitor API quotas and usage
- Update dependencies regularly
- Review security settings
- Backup configuration data
- Monitor performance metrics

### Updates
```bash
# Update dependencies
npm update

# Security audit
npm audit

# Build and deploy
npm run build
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section above
2. Review hosting platform documentation
3. Check Asgardeo console for authentication issues
4. Verify Google Apps Script permissions and quotas

---

**⚠️ Important Security Note:**
Always test the deployment in a staging environment before going live. Never use development credentials in production.
