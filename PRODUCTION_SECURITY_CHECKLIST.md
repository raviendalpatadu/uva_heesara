# 🔒 Production Deployment Security Checklist
## UVA Heesara Tournament Dashboard - uvaheesara.uvaarchery.lk

This checklist ensures your deployment is secure and ready for production use.

## ✅ Pre-Deployment Security Steps

### 1. Credential Security
- [ ] Remove all test/development credentials from codebase
- [ ] Verify `.env.production` is in `.gitignore`
- [ ] Confirm no real API URLs are committed to Git
- [ ] Check that placeholder values are used in `.env.example`

### 2. Asgardeo Production Setup
- [ ] Create new Asgardeo application for production
- [ ] Configure redirect URLs:
  - Sign-in: `https://uvaheesara.uvaarchery.lk/admin`
  - Sign-out: `https://uvaheesara.uvaarchery.lk/`
- [ ] Set allowed origins: `https://uvaheesara.uvaarchery.lk`
- [ ] Enable PKCE (Proof Key for Code Exchange)
- [ ] Configure appropriate token lifetimes
- [ ] Set up proper user groups/roles

### 3. Google Apps Script Security
- [ ] Create production Google Apps Script
- [ ] Set proper sharing permissions (not public)
- [ ] Configure CORS for `uvaheesara.uvaarchery.lk`
- [ ] Test API endpoint access
- [ ] Document the production script ID securely

### 4. GitHub Repository Security
- [ ] Configure GitHub Secrets for deployment
- [ ] Enable Dependabot alerts
- [ ] Set up branch protection rules
- [ ] Review collaborator access

## 🔧 GitHub Secrets Configuration

Add these secrets in your GitHub repository settings:

```
VITE_API_BASE_URL=https://script.google.com/macros/s/YOUR_PRODUCTION_SCRIPT_ID/exec
VITE_ASGARDEO_CLIENT_ID=your-production-asgardeo-client-id
VITE_ASGARDEO_BASE_URL=https://api.asgardeo.io/t/your-production-organization
```

**⚠️ Never commit these values to your code!**

**✅ How It Works:**
- GitHub Actions uses these secrets during build
- Creates a `config.json` file with the configuration
- The deployed app loads configuration from `config.json`
- No secrets are exposed in the client-side code

## 🌐 DNS and Domain Configuration

### DNS Settings for uvaheesara.uvaarchery.lk
- [ ] Configure CNAME record pointing to GitHub Pages
- [ ] Verify DNS propagation (may take 24-48 hours)
- [ ] Enable HTTPS in GitHub Pages settings
- [ ] Test SSL certificate

### GitHub Pages Configuration
- [ ] Enable GitHub Pages from `main` branch
- [ ] Set custom domain: `uvaheesara.uvaarchery.lk`
- [ ] Enforce HTTPS
- [ ] Verify deployment workflow runs successfully

## 🛡️ Security Headers and Configuration

### Recommended HTTP Headers
Add these to your hosting configuration:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### Content Security Policy (CSP)
```
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'unsafe-inline'; 
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
  font-src 'self' https://fonts.gstatic.com; 
  img-src 'self' data: https:; 
  connect-src 'self' https://api.asgardeo.io https://script.google.com;
```

## 🧪 Testing Checklist

### Pre-Deployment Testing
- [ ] Build runs without errors: `npm run build`
- [ ] All tests pass: `npm test`
- [ ] No security vulnerabilities: `npm audit`
- [ ] TypeScript compilation: `npm run type-check`

### Post-Deployment Testing
- [ ] Site loads correctly at `https://uvaheesara.uvaarchery.lk`
- [ ] SSL certificate is valid and secure
- [ ] Authentication flow works (Asgardeo login)
- [ ] Public page displays participant entries correctly
- [ ] Admin dashboard requires authentication
- [ ] Data loads from Google Apps Script API
- [ ] All event filters work correctly
- [ ] Mobile responsiveness works
- [ ] Logout functionality works

## 📊 Monitoring and Maintenance

### Set Up Monitoring
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Set up uptime monitoring
- [ ] Monitor API quota usage
- [ ] Track authentication metrics

### Regular Maintenance Tasks
- [ ] Update dependencies monthly
- [ ] Review access logs weekly
- [ ] Monitor SSL certificate expiration
- [ ] Check for security updates
- [ ] Review and rotate credentials quarterly

## 🚨 Security Incident Response

### Contact Information
- **Primary Admin**: [Your Contact Info]
- **Technical Support**: [Technical Contact]
- **Hosting Provider**: GitHub Pages Support

### Emergency Procedures
1. **Immediate Response**
   - Disable GitHub Pages deployment if needed
   - Revoke Asgardeo application access
   - Change Google Apps Script permissions

2. **Investigation**
   - Check GitHub Actions logs
   - Review access logs
   - Verify credential security

3. **Recovery**
   - Fix security issues
   - Update credentials if compromised
   - Redeploy with fixes
   - Document incident

## 📋 Final Security Verification

Before going live, verify all items below:

### Authentication & Authorization
- [ ] Only authorized users can access admin dashboard
- [ ] Public pages are accessible without authentication
- [ ] Session timeout works correctly
- [ ] Logout removes all session data

### Data Security
- [ ] All communications are over HTTPS
- [ ] API responses don't include sensitive data
- [ ] No credentials visible in browser developer tools
- [ ] No sensitive data in browser local storage

### Infrastructure Security
- [ ] DNS is properly configured
- [ ] SSL/TLS certificate is valid
- [ ] Security headers are implemented
- [ ] No unnecessary services exposed

### Compliance
- [ ] Privacy policy is accessible (if required)
- [ ] Terms of service are clear (if required)
- [ ] Data handling complies with regulations
- [ ] Audit trail is maintained

---

## 🎯 Quick Deployment Commands

```bash
# Final security check
npm audit --audit-level high

# Build for production
npm run build

# Deploy via GitHub Actions (automatic on push to main)
git add .
git commit -m "Production deployment ready"
git push origin main
```

**🔐 Remember**: Security is an ongoing process. Regularly review and update security measures as needed.

---

## ✅ Deployment Complete Checklist

Once deployed, verify:
- [ ] https://uvaheesara.uvaarchery.lk loads correctly
- [ ] Authentication works
- [ ] Data displays properly
- [ ] All functionality tested
- [ ] Monitoring is active
- [ ] Documentation is updated
- [ ] Team is notified

**Congratulations! Your UVA Heesara Tournament Dashboard is now securely deployed! 🎉**
