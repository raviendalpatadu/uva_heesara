# Authentication System - UVA HEESARA Dashboard

## 🔐 Asgardeo OAuth2/OIDC Authentication

The UVA HEESARA dashboard now uses **Asgardeo Identity-as-a-Service** for secure authentication with industry-standard OAuth2/OpenID Connect protocols.

### 🌐 **Public Access**
- **URL**: `https://uvaheesara.uvaarchery.lk`
- **Access**: Open to everyone
- **Features**: View participant details only
- **Auto-refresh**: Every 5 minutes
- **No sensitive data**: Only participant information visible

### 🛡️ **Admin Dashboard** 
- **Access**: Protected by Asgardeo OAuth2/OIDC authentication
- **Features**: Full dashboard with analytics, entry management, and statistics
- **Session**: Managed by Asgardeo identity provider
- **Admin Functions**: All management and analysis tools

## 🔑 **Asgardeo Configuration**

The application is configured with the following Asgardeo settings:

```
Client ID: J_fLYRo81eoG3tG_hU3kVRScNs8a
Base URL: https://api.asgardeo.io/t/mytestorg12
Redirect URL: https://uvaheesara.uvaarchery.lk/
Scope: openid profile
```

⚠️ **Security Note**: These settings are configured for the production environment. Development uses localhost redirect URLs.

## 🚀 **Access Flow**

### Initial Landing Page
Users are presented with two options:
1. **"View Participants (Public Access)"** - Green button for public access
2. **"Admin Dashboard Access"** - OAuth2 login via Asgardeo

### Public View Features
- ✅ Participant table with search and filtering
- ✅ Auto-refresh every 5 minutes
- ✅ Mobile-responsive design
- ✅ "Admin Access" button in header
- ❌ No statistics or analytics
- ❌ No entry management tools
- ❌ No fee analysis

### Admin Dashboard Features
- ✅ Full statistics and analytics
- ✅ Entry fees analysis
- ✅ Entries management
- ✅ Real-time data refresh
- ✅ OAuth2 session management
- ✅ Secure logout functionality

## 🔧 **Technical Implementation**

### Asgardeo Configuration (`src/config/asgardeo.ts`)
- OAuth2/OIDC client configuration
- Environment-specific redirect URLs
- PKCE enabled for enhanced security
- Automatic token refresh

### Authentication Hook (`src/utils/auth.ts`)
- React hook for authentication state
- Login/logout functionality
- User information retrieval
- Token management

### Login Page (`src/components/LoginPage.tsx`)
- Dual-purpose: Public access or OAuth2 login
- Asgardeo authentication flow
- Responsive design with branding

### Public Page (`src/components/PublicPage.tsx`)
- Limited participant view
- Auto-refresh functionality
- Admin access button

### Admin Dashboard (`src/components/AdminDashboard.tsx`)
- Full dashboard functionality
- User information display
- Secure logout
- OAuth2 session management

### App Router (`src/App.tsx`)
- Asgardeo AuthProvider wrapper
- Authentication state management
- Route protection based on auth state

## 🛡️ **Security Features**

### OAuth2/OIDC Protocol
- **Industry Standard**: OAuth2 with OpenID Connect
- **PKCE**: Proof Key for Code Exchange enabled
- **Secure Tokens**: JWT tokens with proper validation
- **No Local Storage**: Credentials managed by Asgardeo

### Session Management
- **Token-based**: OAuth2 access and ID tokens
- **Automatic Refresh**: Tokens refreshed automatically
- **Secure Logout**: Proper token revocation
- **Session Timeout**: Configurable via Asgardeo

### Access Control
- **Route Protection**: Admin routes require valid tokens
- **Token Validation**: Checked on every request
- **Automatic Redirect**: Expired sessions redirect to login
- **Origin Validation**: Secure redirect URL validation

## 📱 **User Experience**

### Public Users
1. Land on welcome page
2. Click "View Participants" for immediate access
3. Browse participant data with search/filter
4. Click "Admin Access" for OAuth2 login

### Admin Users
1. Land on welcome page
2. Click "Sign in with Asgardeo" 
3. Redirected to Asgardeo login page
4. Complete OAuth2 authentication flow
5. Return to dashboard with full access
6. Logout when finished (tokens revoked)

## 🔄 **Authentication Flow**

```
Application Start
    ↓
Asgardeo AuthProvider Initialization
    ↓
Authentication State Check
    ↓
    ├── Not Authenticated → Login Page
    │   ├── Public Access → Public Page
    │   └── OAuth2 Login → Asgardeo → Admin Dashboard
    │
    └── Already Authenticated → Admin Dashboard
```

## 🚨 **Security Considerations**

### Production Deployment
1. **Asgardeo Configuration**: Ensure proper client configuration in Asgardeo console
2. **Environment Variables**: Use environment variables for sensitive configuration
3. **HTTPS Only**: Ensure SSL/TLS encryption for all communications
4. **Redirect URLs**: Configure proper redirect URLs in Asgardeo
5. **Token Security**: Tokens are handled by Asgardeo SDK securely

### Development
- Development uses localhost redirect URLs
- All OAuth2 flows work in development environment
- Easy testing with Asgardeo test accounts
- No local credential storage

## 🔧 **Environment Configuration**

### Production (.env.example)
```bash
VITE_ASGARDEO_CLIENT_ID=J_fLYRo81eoG3tG_hU3kVRScNs8a
VITE_ASGARDEO_BASE_URL=https://api.asgardeo.io/t/mytestorg12
VITE_ASGARDEO_REDIRECT_URL=https://uvaheesara.uvaarchery.lk/
```

### Development (.env.local)
```bash
VITE_ASGARDEO_CLIENT_ID=J_fLYRo81eoG3tG_hU3kVRScNs8a
VITE_ASGARDEO_BASE_URL=https://api.asgardeo.io/t/mytestorg12
VITE_ASGARDEO_REDIRECT_URL=http://127.0.0.1:3002/
```

## 📋 **Deployment Checklist**

- [ ] Asgardeo application configured correctly
- [ ] Production redirect URLs added to Asgardeo
- [ ] Environment variables configured
- [ ] HTTPS enforced on custom domain
- [ ] Public access working correctly
- [ ] Admin OAuth2 flow functional
- [ ] Logout functionality tested
- [ ] Token refresh working properly
