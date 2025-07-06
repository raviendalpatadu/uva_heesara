import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Calculator, Users, Menu, X, Shield } from 'lucide-react';
import Header from './Header';
import StatisticsCards from './StatisticsCards';
import Charts from './Charts';
import ParticipantsTable from './ParticipantsTable';
import EntryFeesAnalysis from './EntryFeesAnalysis';
import EntriesManagement from './EntriesManagement';
import { PageLoading } from './Loading';
import { loadApiData } from '../utils/dataProcessor';
import { useAuth } from '../utils/auth';

type PageView = 'dashboard' | 'fees' | 'entries';

const AdminDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  const { logout, getUserInfo } = useAuth();

  // Load user information
  useEffect(() => {
    const loadUserInfo = async () => {
      const info = await getUserInfo();
      setUserInfo(info);
    };
    
    loadUserInfo();
  }, [getUserInfo]);

  // Close mobile menu when clicking outside or on escape key
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileMenuOpen && !target.closest('[data-mobile-nav]')) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMobileMenuOpen]);

  // Query for dashboard data
  const { data: dashboardData, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['adminDashboardData'],
    queryFn: loadApiData,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleNavigation = (page: PageView) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if logout fails
      window.location.href = '/';
    }
  };

  const navigationItems = [
    { id: 'dashboard' as PageView, label: 'Dashboard', icon: BarChart3 },
    { id: 'fees' as PageView, label: 'Entry Fees Analysis', icon: Calculator },
    { id: 'entries' as PageView, label: 'Entries Management', icon: Users },
  ];

  // Memoize statistics to prevent unnecessary re-renders
  const memoizedStatistics = useMemo(() => {
    return dashboardData?.statistics;
  }, [dashboardData?.statistics]);

  if (isLoading) {
    return <PageLoading message="Loading admin dashboard..." />;
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
          <div className="space-x-4">
            <button 
              onClick={handleRefresh}
              className="btn-primary"
            >
              Try Again
            </button>
            <button 
              onClick={handleLogout}
              className="btn-secondary"
            >
              Logout
            </button>
          </div>
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
        onLogout={handleLogout}
        userInfo={userInfo}
      />
      
      {/* Admin Info Bar */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4" />
              <span className="font-medium">Admin Dashboard</span>
              <span className="text-blue-200">•</span>
              <span className="text-blue-200">Authenticated via Asgardeo</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-blue-200">
                <span>Full access enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8" aria-label="Main navigation">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`nav-button py-4 px-1 border-b-2 font-medium text-sm mobile-transition ${
                    currentPage === item.id ? 'nav-item-active' : 'nav-item-inactive'
                  }`}
                  aria-current={currentPage === item.id ? 'page' : undefined}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden" data-mobile-nav>
            <div className="flex items-center justify-between py-4">
              {/* Current page title */}
              <div className="flex items-center gap-2">
                {(() => {
                  const currentItem = navigationItems.find(item => item.id === currentPage);
                  if (currentItem) {
                    const Icon = currentItem.icon;
                    return (
                      <>
                        <Icon className="w-5 h-5 text-tournament-blue" />
                        <span className="font-medium text-gray-900">{currentItem.label}</span>
                      </>
                    );
                  }
                  return null;
                })()}
              </div>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="nav-button p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-tournament-blue focus:ring-offset-2 mobile-transition"
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation-menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Mobile menu dropdown */}
            {isMobileMenuOpen && (
              <div 
                id="mobile-navigation-menu"
                className="border-t border-gray-200 pb-4 mobile-menu-enter-active"
                data-mobile-nav
                role="menu"
                aria-label="Mobile navigation menu"
              >
                <div className="space-y-1 pt-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item.id)}
                        className={`nav-button w-full flex items-center gap-3 px-3 py-3 text-left text-sm font-medium mobile-transition ${
                          currentPage === item.id ? 'mobile-nav-item-active' : 'mobile-nav-item-inactive'
                        }`}
                        role="menuitem"
                        aria-current={currentPage === item.id ? 'page' : undefined}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(() => {
          switch (currentPage) {
            case 'dashboard':
              return (
                <>
                  <StatisticsCards statistics={memoizedStatistics} />
                  <Charts statistics={memoizedStatistics} />
                  <ParticipantsTable archers={dashboardData.archers} />
                </>
              );
            case 'fees':
              return <EntryFeesAnalysis archers={dashboardData.archers} />;
            case 'entries':
              return <EntriesManagement archers={dashboardData.archers} />;
            default:
              return null;
          }
        })()}
      </main>
    </div>
  );
};

export default AdminDashboard;
