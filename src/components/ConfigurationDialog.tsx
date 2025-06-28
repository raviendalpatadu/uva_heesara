import React, { useState } from 'react';
import { Settings, Save, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface ConfigurationDialogProps {
  isOpen: boolean;
  onSave: (config: { apiBaseUrl: string }) => void;
  onCancel: () => void;
}

const ConfigurationDialog: React.FC<ConfigurationDialogProps> = ({
  isOpen,
  onSave,
  onCancel,
}) => {
  const [apiUrl, setApiUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  const validateApiUrl = async (url: string) => {
    if (!url) {
      setValidationResult({ isValid: false, message: 'URL is required' });
      return false;
    }

    if (!url.includes('script.google.com')) {
      setValidationResult({ 
        isValid: false, 
        message: 'Please enter a valid Google Apps Script URL' 
      });
      return false;
    }

    setIsValidating(true);
    try {
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      if (response.ok) {
        setValidationResult({ 
          isValid: true, 
          message: 'API endpoint is accessible and working!' 
        });
        return true;
      } else {
        setValidationResult({ 
          isValid: false, 
          message: `API returned status ${response.status}. Please check your script deployment.` 
        });
        return false;
      }
    } catch (error) {
      console.warn('API validation failed:', error);
      setValidationResult({ 
        isValid: false, 
        message: 'Unable to connect to the API. Please check the URL and CORS settings.' 
      });
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    if (await validateApiUrl(apiUrl)) {
      onSave({ apiBaseUrl: apiUrl });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Configure API Connection</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="api-url" className="block text-sm font-medium text-gray-700 mb-2">
              Google Apps Script Web App URL
            </label>
            <input
              id="api-url"
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => validateApiUrl(apiUrl)}
            disabled={!apiUrl || isValidating}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isValidating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            <span>{isValidating ? 'Testing...' : 'Test Connection'}</span>
          </button>

          {validationResult && (
            <div className={`flex items-center space-x-2 p-3 rounded-md ${
              validationResult.isValid 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}>
              {validationResult.isValid ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm">{validationResult.message}</span>
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-md">
            <h3 className="font-medium text-blue-900 mb-1">How to get your API URL:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Go to script.google.com</li>
              <li>2. Open your Google Apps Script project</li>
              <li>3. Click "Deploy" → "New deployment"</li>
              <li>4. Type: "Web app", Execute as: "Me", Access: "Anyone"</li>
              <li>5. Copy the web app URL and paste it above</li>
            </ol>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleSave}
            disabled={!validationResult?.isValid}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save & Continue</span>
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationDialog;
