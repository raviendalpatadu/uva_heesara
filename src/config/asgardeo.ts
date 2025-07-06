// Asgardeo authentication configuration
import type { AuthReactConfig } from '@asgardeo/auth-react';

// Get configuration from environment variables or fallbacks (memoized)
const envConfig = {
  clientID: import.meta.env.VITE_ASGARDEO_CLIENT_ID ?? 'J_fLYRo81eoG3tG_hU3kVRScNs8a',
  baseUrl: import.meta.env.VITE_ASGARDEO_BASE_URL ?? 'https://api.asgardeo.io/t/mytestorg12',
  redirectURL: import.meta.env.VITE_ASGARDEO_REDIRECT_URL ?? window.location.origin
};

export const asgardeoConfig: AuthReactConfig = {
  signInRedirectURL: envConfig.redirectURL,
  signOutRedirectURL: envConfig.redirectURL,
  clientID: envConfig.clientID,
  baseUrl: envConfig.baseUrl,
  scope: ['openid', 'profile'],
  resourceServerURLs: [],
  endpoints: {
    authorizationEndpoint: `${envConfig.baseUrl}/oauth2/authorize`,
    tokenEndpoint: `${envConfig.baseUrl}/oauth2/token`,
    userinfoEndpoint: `${envConfig.baseUrl}/oauth2/userinfo`,
    jwksUri: `${envConfig.baseUrl}/oauth2/jwks`,
    revocationEndpoint: `${envConfig.baseUrl}/oauth2/revoke`,
    endSessionEndpoint: `${envConfig.baseUrl}/oidc/logout`
  },
  enablePKCE: true,
  clockTolerance: 300
};

// Development configuration (for localhost testing)
export const asgardeoDevConfig: AuthReactConfig = {
  ...asgardeoConfig,
  signInRedirectURL: 'http://127.0.0.1:3000/',
  signOutRedirectURL: 'http://127.0.0.1:3000/',
};

// Get configuration based on environment
export const getAsgardeoConfig = (): AuthReactConfig => {
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
  
  // Use environment-specific redirect URLs
  if (isLocalhost) {
    return {
      ...asgardeoConfig,
      signInRedirectURL: 'http://127.0.0.1:3000/admin',
      signOutRedirectURL: 'http://127.0.0.1:3000/',
    };
  }
  
  // For production, redirect to admin after authentication
  return {
    ...asgardeoConfig,
    signInRedirectURL: 'https://uvaheesara.uvaarchery.lk/admin',
    signOutRedirectURL: 'https://uvaheesara.uvaarchery.lk/',
  };
};
