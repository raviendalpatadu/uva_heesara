import React from 'react';
import { RefreshCw } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  isLoading?: boolean;
  lastUpdated?: Date;
}

const Header: React.FC<HeaderProps> = ({  
  onRefresh, 
  isLoading = false,
  lastUpdated 
}) => {
  
  const formatLastUpdated = (date?: Date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="header-container h-auto sm:h-16 py-4 sm:py-0">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <img 
              src="./data/AR2fclrsBl2.png" 
              alt="UVA HEESARA 2025" 
              className="logo"
            />
            <div>
              <h1 className="header-title">
                <span className="hidden sm:inline">UVA HEESARA Open Archery Championship</span>
                <span className="sm:hidden">UVA HEESARA 2025</span>
              </h1>
              <p className="header-subtitle">
                Entries Dashboard - 2025
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="header-actions">
            {lastUpdated && (
              <span className="responsive-text text-gray-500 text-center sm:text-left">
                <span className="hidden sm:inline">Last updated: </span>
                <span className="sm:hidden">Updated: </span>
                {formatLastUpdated(lastUpdated)}
              </span>
            )}
            
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={`btn-secondary flex items-center justify-center space-x-2 mobile-full-width touch-target ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
              title={isLoading ? "Refreshing data..." : "Refresh data from Google Sheets"}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isLoading ? 'Refreshing...' : 'Refresh'}</span>
              <span className="sm:hidden">{isLoading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
