# 🔧 Logout Issue Troubleshooting Guide

## ❌ **Problem: Logout Fails with "access_denied" Error**

**Error Message:**
```
oauthErrorCode: access_denied
oauthErrorMsg: Post logout URI does not match with registered callback URL
```

## 🎯 **Root Cause**

The logout redirect URL in your code doesn't match what's configured in your Asgardeo application settings.

## ✅ **Solution Steps**

### **Step 1: Update Asgardeo Application Settings**

1. **Go to Asgardeo Console:**
   - Visit: https://console.asgardeo.io/
   - Login and select your organization
   - Find your UVA Heesara application

2. **Update Redirect URLs:**

   **Sign-in redirect URLs:**
   ```
   https://uvaheesara.uvaarchery.lk/admin
   http://127.0.0.1:3000/admin
   ```

   **Sign-out redirect URLs:**
   ```
   https://uvaheesara.uvaarchery.lk/
   http://127.0.0.1:3000/
   ```

   **Allowed origins:**
   ```
   https://uvaheesara.uvaarchery.lk
   http://127.0.0.1:3000
   ```

### **Step 2: Verify Configuration Match**

**Your app is trying to redirect to:**
- Production: `https://uvaheesara.uvaarchery.lk/`
- Development: `http://127.0.0.1:3000/`

**Asgardeo must have these exact URLs** in the sign-out redirect URLs list.

### **Step 3: Test the Fix**

1. **Save the Asgardeo settings**
2. **Wait 2-3 minutes** for changes to propagate
3. **Try logout again**

## 🔍 **How to Check Current Settings**

### **In Asgardeo Console:**
1. Applications → Your App → Settings → Access
2. Look for "Allowed redirect URLs"
3. Look for "Allowed origins"

### **Common URL Formats:**
```
✅ Correct: https://uvaheesara.uvaarchery.lk/
❌ Wrong:   https://uvaheesara.uvaarchery.lk
❌ Wrong:   https://uvaheesara.uvaarchery.lk/admin

✅ Correct: http://127.0.0.1:3000/
❌ Wrong:   http://localhost:3000/
❌ Wrong:   http://127.0.0.1:3000
```

## 🚀 **Alternative: Force Logout (Fallback)**

If Asgardeo logout continues to fail, the app now includes a fallback:

```typescript
// Enhanced logout with fallback
const handleLogout = async () => {
  try {
    await logout(); // Try Asgardeo logout
  } catch (error) {
    // Clear local data and redirect anyway
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  }
};
```

## 🔧 **Quick Debug Steps**

### **1. Check Browser Network Tab:**
- Look for logout request
- Check the redirect URL being sent
- Compare with Asgardeo settings

### **2. Check Console Errors:**
- Look for specific error messages
- Note the exact redirect URL

### **3. Test in Development:**
- Try logout on `http://127.0.0.1:3000/admin`
- Check if same error occurs locally

## 📋 **Verification Checklist**

After fixing Asgardeo settings:

- [ ] Login works correctly
- [ ] Can access admin dashboard
- [ ] Logout redirects to home page
- [ ] No error messages in console
- [ ] Can login again after logout

## 🎉 **Expected Behavior After Fix**

1. **User clicks Logout** in admin dashboard
2. **Asgardeo processes logout** 
3. **Redirects to:** `https://uvaheesara.uvaarchery.lk/`
4. **User sees public page** (not admin dashboard)
5. **Session is cleared** completely

## ⚠️ **Important Notes**

- **URL matching is exact** - trailing slashes matter
- **Changes take 2-3 minutes** to propagate in Asgardeo
- **Clear browser cache** if issues persist
- **Both production and development URLs** should be configured

---

**The logout issue should be resolved once the Asgardeo redirect URLs are properly configured!** 🎯
