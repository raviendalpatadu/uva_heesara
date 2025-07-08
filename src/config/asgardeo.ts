// Asgardeo authentication configuration
import type { AuthReactConfig } from '@asgardeo/auth-react';

// Get configuration from environment variables or fallbacks (memoized)
const envConfig = {
  clientID: import.meta.env.VITE_ASGARDEO_CLIENT_ID ?? 'your-asgardeo-client-id',
  baseUrl: import.meta.env.VITE_ASGARDEO_BASE_URL ?? 'https://api.asgardeo.io/t/your-organization',
  redirectURL: import.meta.env.VITE_ASGARDEO_REDIRECT_URL ?? window.location.origin,
  productionDomain: import.meta.env.VITE_PRODUCTION_DOMAIN ?? 'uvaheesara.uvaarchery.lk'
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

// Get configuration based on environment
export const getAsgardeoConfig = (): AuthReactConfig => {
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
  
  const isProduction = window.location.hostname === envConfig.productionDomain;
  
  // Use environment-specific redirect URLs
  if (isLocalhost) {
    return {
      ...asgardeoConfig,
      signInRedirectURL: `${window.location.origin}/admin`,
      signOutRedirectURL: window.location.origin,
    };
  }
  
  if (isProduction) {
    return {
      ...asgardeoConfig,
      signInRedirectURL: `https://${envConfig.productionDomain}/admin`,
      signOutRedirectURL: `https://${envConfig.productionDomain}`,
    };
  }
  
  // Default production configuration
  return {
    ...asgardeoConfig,
    signInRedirectURL: `https://${envConfig.productionDomain}/admin`,
    signOutRedirectURL: `https://${envConfig.productionDomain}`,
  };
};
