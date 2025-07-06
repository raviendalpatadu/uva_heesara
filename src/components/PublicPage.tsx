import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Header from './Header';
import ParticipantsTable from './ParticipantsTable';
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
        {/* Public View Notice */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-800">
                Public View - Participant Information
              </span>
            </div>
            <Link
              to="/admin"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Admin Access →
            </Link>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Viewing participant details for UVA HEESARA 2025. Data refreshes automatically every 5 minutes.
          </p>
        </div>

        {/* Participants Table - Public View */}
        <ParticipantsTable 
          archers={dashboardData.archers} 
          isPublicView={true}
        />
      </main>
    </div>
  );
};

export default PublicPage;
