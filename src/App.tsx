import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { BarChart3, Calculator, Users, Menu, X } from 'lucide-react';
import Header from './components/Header';
import StatisticsCards from './components/StatisticsCards';
import Charts from './components/Charts';
import ParticipantsTable from './components/ParticipantsTable';
import EntryFeesAnalysis from './components/EntryFeesAnalysis';
import EntriesManagement from './components/EntriesManagement';
import ConfigurationDialog from './components/ConfigurationDialog';
import { PageLoading } from './components/Loading';
import { loadApiData } from './utils/dataProcessor';
import { RuntimeConfigLoader } from './utils/runtimeConfig';

type PageView = 'dashboard' | 'fees' | 'entries';

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
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleNavigation = (page: PageView) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false); // Close mobile menu when navigation occurs
  };

  const navigationItems = [
    { id: 'dashboard' as PageView, label: 'Dashboard', icon: BarChart3 },
    { id: 'fees' as PageView, label: 'Entry Fees Analysis', icon: Calculator },
    { id: 'entries' as PageView, label: 'Entries Management', icon: Users },
  ];

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
                  <StatisticsCards statistics={dashboardData.statistics} />
                  <Charts statistics={dashboardData.statistics} />
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

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
};

export default App;
