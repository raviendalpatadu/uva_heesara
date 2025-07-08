import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@asgardeo/auth-react';
import PublicPage from './components/PublicPage';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { PageLoading } from './components/Loading';
import { RuntimeConfigLoader } from './utils/runtimeConfig';
import { getAsgardeoConfig } from './config/asgardeo';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const AppContent: React.FC = () => {
  const [configLoaded, setConfigLoaded] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  // Load runtime configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        await RuntimeConfigLoader.loadConfig();
        setConfigLoaded(true);
      } catch (error) {
        console.error('Failed to load configuration:', error);
        setConfigError(error instanceof Error ? error.message : 'Configuration loading failed');
      }
    };

    loadConfig();
  }, []);

  // Show error if configuration fails to load
  if (configError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Configuration Error</h2>
            <p className="text-gray-600 mb-4">{configError}</p>
            <p className="text-sm text-gray-500">
              Please ensure VITE_API_BASE_URL is properly configured in your environment variables or GitHub secrets.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!configLoaded) {
    return <PageLoading message="Loading application..." />;
  }

  return (
    <Router>
      <Routes>
        {/* Public home page */}
        <Route path="/" element={<PublicPage />} />
        
        {/* Protected admin routes */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider config={getAsgardeoConfig()}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
