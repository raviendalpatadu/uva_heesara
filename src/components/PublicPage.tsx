import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from './Header';
import EventEntriesDisplay from './EventEntriesDisplay';
import { PageLoading } from './Loading';
import { loadApiData } from '../utils/dataProcessor';

const PublicPage: React.FC = () => {
  // Query for participant data
  const { data: dashboardData, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['publicParticipantsData'],
    queryFn: loadApiData,
    retry: 1,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes for public view
  });

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return <PageLoading message="Loading participant data..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          onRefresh={handleRefresh}
          isLoading={false}
          isPublicView={true}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="mb-4">
              <img 
                src="/data/AR2fclrsBl2.png" 
                alt="UVA HEESARA 2025" 
                className="w-24 h-24 object-contain mx-auto mb-4"
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to Load Participant Data
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
      </div>
    );
  }

  if (!dashboardData) {
    return <PageLoading message="No participant data available..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onRefresh={handleRefresh}
        isLoading={isFetching}
        lastUpdated={dashboardData?.lastUpdated}
        isPublicView={true}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Entries Display - Public View */}
        <EventEntriesDisplay 
          archers={dashboardData.archers} 
        />
      </main>
    </div>
  );
};

export default PublicPage;
