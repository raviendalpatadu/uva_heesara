// Authentication utility using Asgardeo OAuth2/OIDC
import { useAuthContext } from '@asgardeo/auth-react';
import { useCallback } from 'react';

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
}

// Custom hook for authentication state
export const useAuth = () => {
  const { 
    state, 
    signIn, 
    signOut, 
    getBasicUserInfo, 
    getIDToken,
    getAccessToken 
  } = useAuthContext();

  const login = useCallback(async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [signIn]);

  const logout = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, [signOut]);

  const getUserInfo = useCallback(async () => {
    try {
      return await getBasicUserInfo();
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }, [getBasicUserInfo]);

  const getTokens = useCallback(async () => {
    try {
      const [idToken, accessToken] = await Promise.all([
        getIDToken(),
        getAccessToken()
      ]);
      return { idToken, accessToken };
    } catch (error) {
      console.error('Failed to get tokens:', error);
      return { idToken: null, accessToken: null };
    }
  }, [getIDToken, getAccessToken]);

  return {
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    user: state.username,
    login,
    logout,
    getUserInfo,
    getTokens
  };
};

// Legacy AuthManager for backward compatibility (deprecated)
class AuthManager {
  static isAuthenticated(): boolean {
    console.warn('AuthManager.isAuthenticated() is deprecated. Use useAuth() hook instead.');
    return false;
  }

  static getCurrentUser(): string | null {
    console.warn('AuthManager.getCurrentUser() is deprecated. Use useAuth() hook instead.');
    return null;
  }

  static async login(): Promise<{ success: boolean; error?: string }> {
    console.warn('AuthManager.login() is deprecated. Use useAuth() hook instead.');
    return { success: false, error: 'Please use Asgardeo authentication' };
  }

  static logout(): void {
    console.warn('AuthManager.logout() is deprecated. Use useAuth() hook instead.');
  }

  static getAuthState(): AuthState {
    console.warn('AuthManager.getAuthState() is deprecated. Use useAuth() hook instead.');
    return {
      isAuthenticated: false,
      user: null,
      isLoading: false
    };
  }

  static getSessionTimeRemaining(): number {
    console.warn('AuthManager.getSessionTimeRemaining() is deprecated. Asgardeo handles session management.');
    return 0;
  }
}

export { AuthManager };
