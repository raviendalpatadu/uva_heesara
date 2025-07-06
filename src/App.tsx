import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@asgardeo/auth-react';
import PublicPage from './components/PublicPage';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ConfigurationDialog from './components/ConfigurationDialog';
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
  const [configNeeded, setConfigNeeded] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);

  // Load runtime configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        await RuntimeConfigLoader.loadConfig();
        setConfigLoaded(true);
      } catch (error) {
        console.warn('Configuration needed:', error);
        setConfigNeeded(true);
      }
    };

    loadConfig();
  }, []);

  const handleConfigSave = async (config: { apiBaseUrl: string }) => {
    // Save configuration to localStorage
    const fullConfig = {
      apiBaseUrl: config.apiBaseUrl,
      environment: 'production',
      allowedOrigins: [window.location.origin],
      enableEncryption: false,
      apiTimeout: 10000,
    };

    localStorage.setItem('uva_heesara_config', JSON.stringify(fullConfig));
    setConfigNeeded(false);
    setConfigLoaded(true);
  };

  // Show configuration dialog if needed
  if (configNeeded) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ConfigurationDialog 
          isOpen={true}
          onSave={handleConfigSave}
          onCancel={() => setConfigNeeded(false)}
        />
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
