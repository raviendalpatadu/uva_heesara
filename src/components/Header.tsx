import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Shield, LogOut, User } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  isLoading?: boolean;
  lastUpdated?: Date;
  isPublicView?: boolean;
  onLogout?: () => void;
  userInfo?: any;
}

const Header: React.FC<HeaderProps> = ({  
  onRefresh, 
  isLoading = false,
  lastUpdated,
  isPublicView = false,
  onLogout,
  userInfo
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
              src="/data/AR2fclrsBl2.png" 
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
          <div className="header-actions flex-wrap sm:flex-nowrap gap-2 sm:gap-3">
            {lastUpdated && (
              <span className="responsive-text text-gray-500 text-center sm:text-left order-last sm:order-first w-full sm:w-auto">
                <span className="hidden sm:inline">Last updated: </span>
                <span className="sm:hidden">Updated: </span>
                {formatLastUpdated(lastUpdated)}
              </span>
            )}
            
            {/* User Info (Admin View Only) */}
            {!isPublicView && userInfo && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full text-sm text-blue-700 order-first sm:order-none">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {userInfo.displayName ?? userInfo.username ?? 'Admin'}
                </span>
                <span className="sm:hidden">
                  {(userInfo.displayName ?? userInfo.username ?? 'Admin').split(' ')[0]}
                </span>
              </div>
            )}
            
            {/* Admin Access Button (Public View Only) */}
            {isPublicView && (
              <Link
                to="/admin"
                className="btn-secondary flex items-center justify-center space-x-2 mobile-full-width touch-target hover:bg-gray-100 order-2 sm:order-none"
                title="Access admin dashboard"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin Access</span>
                <span className="sm:hidden">Admin</span>
              </Link>
            )}
            
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={`btn-secondary flex items-center justify-center space-x-2 mobile-full-width touch-target order-3 sm:order-none ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
              title={isLoading ? "Refreshing data..." : "Refresh data from Google Sheets"}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isLoading ? 'Refreshing...' : 'Refresh'}</span>
              <span className="sm:hidden">{isLoading ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            {/* Logout Button (Admin View Only) */}
            {!isPublicView && onLogout && (
              <button
                onClick={onLogout}
                className="btn-danger flex items-center justify-center space-x-2 mobile-full-width touch-target hover:bg-red-600 order-4 sm:order-none"
                title="Logout from admin dashboard"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
