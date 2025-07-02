# 🚀 GitHub Pages Deployment Checklist

Follow this checklist to securely deploy your UVA HEESARA Dashboard to GitHub Pages.

## ✅ Pre-Deployment Checklist

### 1. Google Apps Script Setup
- [ ] Google Apps Script is deployed as a web app
- [ ] Permissions set to "Anyone can access" 
- [ ] Execution set to "User accessing the web app"
- [ ] Web app URL copied for GitHub Secrets

### 2. Repository Setup  
- [ ] Code pushed to GitHub repository
- [ ] Repository is public (required for free GitHub Pages)
- [ ] Main branch exists with your code

### 3. GitHub Secrets Configuration
Go to Repository → Settings → Secrets and variables → Actions

Add these secrets:
- [ ] **VITE_API_BASE_URL**: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`
- [ ] **VITE_ALLOWED_ORIGINS**: `https://uvaheesara.uvaarchery.lk`

Optional secrets for enhanced security:
- [ ] **VITE_API_KEY**: Your API key (if implementing custom auth)
- [ ] **VITE_ENABLE_API_ENCRYPTION**: `true` (for additional security)

### 4. GitHub Pages Setup
- [ ] Go to Repository → Settings → Pages
- [ ] Source: "GitHub Actions" (not "Deploy from a branch")
- [ ] Save settings

## 🚀 Deployment Process

### 1. Trigger Deployment
- [ ] Push code to main branch
- [ ] Go to repository → Actions tab
- [ ] Verify "Deploy to GitHub Pages" workflow is running

### 2. Monitor Deployment
- [ ] Build job completes successfully  
- [ ] Deploy job completes successfully
- [ ] Green checkmark appears on the workflow

### 3. Access Your Dashboard
Your dashboard will be available at: `https://uvaheesara.uvaarchery.lk`

## 🔍 Post-Deployment Verification

### 1. Functionality Test
- [ ] Dashboard loads without errors
- [ ] Data loads from Google Sheets API
- [ ] All charts and statistics display correctly
- [ ] Table sorting and filtering work
- [ ] Mobile responsiveness works

### 2. Security Test
- [ ] Open browser dev tools → Network tab
- [ ] Refresh the page and check API requests
- [ ] API URLs should include fingerprint parameters
- [ ] No sensitive information exposed in source

### 3. Performance Test  
- [ ] Page loads quickly (< 3 seconds)
- [ ] No console errors in browser dev tools
- [ ] All images and assets load properly

## 🔧 Troubleshooting

### Build Failures
If deployment fails, check:
- [ ] All GitHub Secrets are set correctly
- [ ] No typos in secret names
- [ ] API URL is accessible and returns JSON
- [ ] Node.js version compatibility in workflow

### Runtime Errors
If dashboard loads but doesn't work:
- [ ] Check browser console for JavaScript errors
- [ ] Verify API endpoint is accessible
- [ ] Test API URL directly in browser
- [ ] Check CORS settings in Google Apps Script

### Security Errors
If you see "Unauthorized origin" errors:
- [ ] Verify VITE_ALLOWED_ORIGINS matches your GitHub Pages URL exactly
- [ ] Update Google Apps Script to allow your domain
- [ ] Clear browser cache and try again

## 📱 Testing Checklist

### Desktop Testing
- [ ] Chrome/Chromium
- [ ] Firefox  
- [ ] Safari (if available)
- [ ] Edge

### Mobile Testing
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Responsive design at 768px, 1024px, 1200px

### Feature Testing
- [ ] Refresh button works and shows loading state
- [ ] All charts render correctly
- [ ] Table pagination works
- [ ] Search functionality works
- [ ] Mobile card view displays properly

## 🎯 Success Criteria

✅ **Your deployment is successful when:**
- Dashboard is accessible at your GitHub Pages URL
- Data loads from Google Sheets without errors
- All interactive features work as expected
- No security warnings in browser console
- Mobile and desktop views render correctly

## 📞 Need Help?

If you encounter issues:
1. Check the GitHub Actions logs for specific error messages
2. Review the `SECURITY.md` file for detailed configuration
3. Verify your Google Apps Script is working independently
4. Test your API endpoint directly in the browser

---

**🎉 Congratulations!** Once all items are checked, your secure dashboard is live on GitHub Pages!
