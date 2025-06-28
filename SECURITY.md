# Security Configuration and Deployment Guide

## Overview

This document outlines the security measures implemented for the UVA HEESARA Dashboard and provides a step-by-step guide for secure deployment to GitHub Pages.

## Security Features Implemented

### 1. Environment-Based Configuration
- **Environment Variables**: API endpoints and keys are stored in environment variables
- **Development vs Production**: Different security levels for development and production
- **Configuration Management**: Centralized security configuration in `src/utils/security.ts`

### 2. Origin Validation
- **Allowed Origins**: Restricts API access to approved domains
- **Development Mode**: Allows localhost/127.0.0.1 for development
- **Production Mode**: Only allows specified GitHub Pages domains

### 3. Rate Limiting
- **Request Throttling**: Limits to 10 requests per minute per client
- **Automatic Backoff**: Prevents abuse and reduces server load
- **User-Friendly Messages**: Informs users about wait times

### 4. Request Obfuscation
- **URL Fingerprinting**: Adds request fingerprints to API calls
- **Timestamp Parameters**: Prevents request caching/replay
- **Basic Obfuscation**: Makes API endpoints less obvious in network traffic

### 5. Build-Time Security
- **Sourcemap Disabled**: Prevents API endpoint exposure in production builds
- **Console Removal**: Removes debug information in production
- **Minification**: Obfuscates code structure

## Secure Deployment Checklist

### Step 1: Prepare Your Google Apps Script

1. **Update your Google Apps Script** to handle the new security headers:
   ```javascript
   function doGet(e) {
     // Add origin validation
     const allowedOrigins = [
       'https://yourusername.github.io',
       'http://localhost:3000',
       'http://127.0.0.1:3000'
     ];
     
     const origin = e.headers['Origin'] || e.headers['origin'];
     if (origin && !allowedOrigins.some(allowed => origin.includes(allowed))) {
       return ContentService
         .createTextOutput(JSON.stringify({error: 'Unauthorized origin'}))
         .setMimeType(ContentService.MimeType.JSON);
     }
     
     // Your existing data fetching logic here
     return ContentService
       .createTextOutput(JSON.stringify(data))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

2. **Deploy the updated script** and copy the new web app URL

### Step 2: Configure GitHub Repository Secrets

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Add the following repository secrets:

   - **VITE_API_BASE_URL**: Your Google Apps Script web app URL
     ```
     https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
     ```

   - **VITE_ALLOWED_ORIGINS**: Your GitHub Pages domain
     ```
     https://yourusername.github.io
     ```

   - **VITE_API_KEY**: (Optional) If you implement API key authentication
     ```
     your-secure-api-key-here
     ```

   - **VITE_ENABLE_API_ENCRYPTION**: (Optional) Enable additional security
     ```
     true
     ```

### Step 3: Update Repository Settings

1. **Enable GitHub Pages**:
   - Go to Repository → Settings → Pages
   - Source: "GitHub Actions"
   - Leave other settings as default

2. **Update Environment Variables** in `.env.local` for development:
   ```env
   VITE_API_BASE_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   VITE_ENVIRONMENT=development
   ```

### Step 4: Deploy

1. **Push to main branch**: The GitHub Action will automatically build and deploy
2. **Monitor deployment**: Check the Actions tab for deployment status
3. **Verify security**: Test that the app only works from your GitHub Pages domain

## Additional Security Recommendations

### 1. Google Apps Script Security

- **Restrict Execution**: Set script execution to "User accessing the web app"
- **Limit Access**: Consider restricting to "Anyone with Google account" if possible
- **Add Logging**: Log all requests for monitoring purposes
- **Implement Rate Limiting**: Add server-side rate limiting in your script

### 2. Advanced Protection (Optional)

If you need higher security, consider:

- **API Gateway**: Use a service like Cloudflare Workers or Vercel Edge Functions as a proxy
- **Authentication**: Implement user authentication before API access
- **CORS Proxy**: Use a dedicated CORS proxy service
- **Data Encryption**: Encrypt sensitive data in transit

### 3. Monitoring and Maintenance

- **Regular Updates**: Keep dependencies updated
- **Monitor Usage**: Check for unusual API usage patterns
- **Backup Data**: Regularly backup your Google Sheets data
- **Update Secrets**: Rotate API keys and secrets periodically

## Environment Variables Reference

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Google Apps Script web app URL | `https://script.google.com/...` | Yes |
| `VITE_ENVIRONMENT` | Environment mode | `production` or `development` | No |
| `VITE_ALLOWED_ORIGINS` | Comma-separated list of allowed origins | `https://user.github.io,https://custom.domain.com` | No |
| `VITE_API_KEY` | Optional API key for additional security | `your-secret-key` | No |
| `VITE_ENABLE_API_ENCRYPTION` | Enable additional request encryption | `true` or `false` | No |
| `VITE_API_TIMEOUT` | Request timeout in milliseconds | `10000` | No |

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your Google Apps Script allows your domain
2. **Rate Limiting**: Users see "Rate limit exceeded" - this is normal security behavior
3. **Environment Variables**: Check that all required secrets are set in GitHub
4. **Build Failures**: Ensure all environment variables are properly quoted in GitHub secrets

### Testing Security

1. **Test from different domains**: Verify that only your GitHub Pages domain can access the API
2. **Test rate limiting**: Make multiple rapid requests to ensure rate limiting works
3. **Check network requests**: Verify that API URLs are obfuscated in browser dev tools

## Contact and Support

For issues with this security implementation:
1. Check the GitHub Actions logs for deployment errors
2. Verify all environment variables are correctly set
3. Test the Google Apps Script independently
4. Review browser console for client-side errors

Remember: Security is an ongoing process. Regularly review and update these measures as needed.
