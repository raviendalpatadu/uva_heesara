import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from './Header';
import EventEntriesDisplay from './EventEntriesDisplay';
import TargetAssignments from './TargetAssignments';
import { PageLoading } from './Loading';
import { loadApiData } from '../utils/dataProcessor';
import { Target, Users } from 'lucide-react';

const PublicPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'entries' | 'targets'>('entries');

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
        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('entries')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'entries'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Event Entries</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('targets')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'targets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Target Assignments</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'entries' && (
          <EventEntriesDisplay 
            archers={dashboardData.archers} 
          />
        )}
        
        {activeTab === 'targets' && (
          <TargetAssignments 
            apiBaseUrl={import.meta.env.VITE_API_BASE_URL} 
          />
        )}
      </main>
    </div>
  );
};

export default PublicPage;
