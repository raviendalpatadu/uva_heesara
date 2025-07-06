import React from 'react';
import { Shield, ArrowRight, Key, Loader2 } from 'lucide-react';
import { useAuth } from '../utils/auth';

interface LoginPageProps {
  onPublicAccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onPublicAccess }) => {
  const { login, isLoading } = useAuth();

  const handleAdminLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
      // Error handling is managed by Asgardeo
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tournament-blue to-blue-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <img 
            src="/data/AR2fclrsBl2.png" 
            alt="UVA HEESARA 2025" 
            className="w-20 h-20 object-contain mx-auto mb-4"
          />
          <h2 className="text-3xl font-bold text-white">
            UVA HEESARA 2025
          </h2>
          <p className="mt-2 text-blue-200">
            Archery Championship Management
          </p>
        </div>

        {/* Access Options */}
        <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
          {/* Public Access Button */}
          <div className="text-center">
            <button
              onClick={onPublicAccess}
              className="w-full flex items-center justify-center gap-3 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
            >
              <ArrowRight className="w-5 h-5" />
              View Participants (Public Access)
            </button>
            <p className="text-sm text-gray-600 mt-2">
              View participant details without admin access
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Admin Login Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-tournament-blue" />
              <h3 className="text-lg font-semibold text-gray-900">
                Admin Dashboard Access
              </h3>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">
                      Secure OAuth2 Authentication
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Admin access is protected by Asgardeo identity service. 
                      You'll be redirected to a secure login page.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAdminLogin}
                disabled={isLoading}
                className="w-full bg-tournament-blue text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-tournament-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirecting to Login...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Sign in with Asgardeo
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center space-y-1">
              <p>✓ Secure OAuth2/OpenID Connect authentication</p>
              <p>✓ No passwords stored locally</p>
              <p>✓ Session managed by identity provider</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-blue-200 text-sm">
          <p>&copy; 2025 UVA HEESARA Open Archery Championship</p>
          <p className="text-xs mt-1">Powered by Asgardeo Identity</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
