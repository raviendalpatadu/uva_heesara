import React from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import Header from './components/Header';
import StatisticsCards from './components/StatisticsCards';
import Charts from './components/Charts';
import ParticipantsTable from './components/ParticipantsTable';
import { PageLoading } from './components/Loading';
import { loadApiData } from './utils/dataProcessor';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const Dashboard: React.FC = () => {
  // Query for dashboard data - using API instead of default CSV
  const { data: dashboardData, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: loadApiData, // Changed from loadDefaultData to loadApiData
    retry: 1,
  });

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
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
