import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import Header from './components/Header';
import StatisticsCards from './components/StatisticsCards';
import Charts from './components/Charts';
import ParticipantsTable from './components/ParticipantsTable';
import ConfigurationDialog from './components/ConfigurationDialog';
import { PageLoading } from './components/Loading';
import { loadApiData } from './utils/dataProcessor';
import { RuntimeConfigLoader } from './utils/runtimeConfig';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const Dashboard: React.FC = () => {
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
    
    // Refresh the page to load data with new config
    window.location.reload();
  };

  // Query for dashboard data - using API instead of default CSV
  const { data: dashboardData, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: loadApiData, // Changed from loadDefaultData to loadApiData
    retry: 1,
    enabled: configLoaded, // Only run query when config is loaded
  });

  const handleRefresh = () => {
    refetch();
  };

  // Show configuration dialog if needed
  if (configNeeded) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          onRefresh={() => {}}
          isLoading={false}
        />
        <ConfigurationDialog 
          isOpen={true}
          onSave={handleConfigSave}
          onCancel={() => setConfigNeeded(false)}
        />
      </div>
    );
  }

  if (isLoading || !configLoaded) {
    return <PageLoading message="Loading tournament data..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4">
            <img 
              src="/data/AR2fclrsBl2.png" 
              alt="UVA HEESARA 2025" 
              className="w-24 h-24 object-contain mx-auto mb-4"
            />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to Load Data
          </h2>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
          <button 
            onClick={handleRefresh}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return <PageLoading message="No data available..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onRefresh={handleRefresh}
        isLoading={isFetching}
        lastUpdated={dashboardData?.lastUpdated}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatisticsCards statistics={dashboardData.statistics} />
        <Charts statistics={dashboardData.statistics} />
        <ParticipantsTable archers={dashboardData.archers} />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
};

export default App;
