import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = 'text-tournament-blue' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-current ${sizeClasses[size]} ${color}`} />
  );
};

interface LoadingOverlayProps {
  message?: string;
  progress?: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = 'Loading...', 
  progress 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
        <div className="mb-4">
          <LoadingSpinner size="large" />
        </div>
        <p className="text-gray-700 mb-4">{message}</p>
        {progress !== undefined && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-tournament-blue h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

interface PageLoadingProps {
  message?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({ 
  message = 'Loading dashboard...' 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <img 
              src="./data/AR2fclrsBl2.png" 
              alt="UVA HEESARA 2025" 
              className="w-24 h-24 object-contain"
            />
          </div>
          <div className="flex justify-center">
            <LoadingSpinner size="large" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          UVA HEESARA Open Archery Championship
        </h2>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
