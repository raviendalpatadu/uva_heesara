# GitHub Pages Deployment Troubleshooting

## ✅ Issue Fixed: Asset 404 Errors

The 404 errors for CSS and JS files have been resolved by setting the correct base path in `vite.config.ts`:

```typescript
base: '/uva_heesara/', // Set the base path for GitHub Pages deployment
```

## 🔍 Common GitHub Pages Issues & Solutions

### 1. Assets Not Loading (404 Errors)
**Problem**: CSS/JS files return 404 errors  
**Cause**: Incorrect base path for GitHub Pages subdirectory  
**Solution**: ✅ Fixed - Added `base: '/uva_heesara/'` to Vite config

### 2. GitHub Pages Not Enabled
**Check**: Repository → Settings → Pages  
**Required**: Source should be "GitHub Actions" (not "Deploy from a branch")

### 3. Repository Visibility
**Check**: Repository must be public for free GitHub Pages  
**Note**: Private repos require GitHub Pro/Team plan for Pages

### 4. Workflow Permissions
**Check**: Repository → Settings → Actions → General → Workflow permissions  
**Required**: "Read and write permissions" or at least "Read repository contents and packages permissions"

### 5. Branch Protection
**Check**: If `master` branch has protection rules  
**Solution**: Allow GitHub Actions to bypass restrictions

## 📋 Deployment Checklist

When you push to `master` branch:

1. **GitHub Action Runs**: Check Actions tab for workflow execution
2. **Build Succeeds**: Green checkmark on build job
3. **Deploy Succeeds**: Green checkmark on deploy job  
4. **Site Updates**: Changes appear at `https://raviendralpatadu.github.io/uva_heesara/`

## 🔧 Manual Deployment Trigger

If automatic deployment doesn't work:
1. Go to repository → Actions
2. Click "Deploy to GitHub Pages" workflow
3. Click "Run workflow" → "Run workflow"

## 🌐 Expected Site URL

Your dashboard should be accessible at:
```
https://raviendralpatadu.github.io/uva_heesara/
```

## ⚠️ Still Having Issues?

If the site still doesn't load after the fix:

1. **Clear Browser Cache**: Hard refresh (Ctrl+F5 or Cmd+Shift+R)
2. **Check Network Tab**: Look for any remaining 404 errors
3. **Verify GitHub Pages Settings**: Ensure source is "GitHub Actions"
4. **Check Action Logs**: Look for any deployment errors in GitHub Actions

## 📞 Next Steps

1. Push the updated code to trigger a new deployment
2. Wait for GitHub Actions to complete (usually 2-5 minutes)
3. Access your site at the URL above
4. If data doesn't load, proceed with API configuration as outlined in `SECURITY.md`
