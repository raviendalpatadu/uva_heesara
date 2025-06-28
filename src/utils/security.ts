// Security configuration and utilities
export interface SecurityConfig {
  apiBaseUrl: string;
  apiKey?: string;
  allowedOrigins: string[];
  environment: 'development' | 'production';
  enableEncryption: boolean;
  apiTimeout: number;
}

class ConfigManager {
  private static config: SecurityConfig | null = null;

  static getConfig(): SecurityConfig {
    this.config ??= this.loadConfig();
    return this.config;
  }

  private static loadConfig(): SecurityConfig {
    // Get environment variables with fallbacks
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 
      'https://script.google.com/macros/s/AKfycbxjT0SMNe5-a3WqRQtW82QRBahkghJpbw1blqam9kXx3Vsgne0OO54jFG4nSD2NorI/exec';
    
    const environment = import.meta.env.VITE_ENVIRONMENT === 'production' ? 'production' : 'development';
    
    return {
      apiBaseUrl,
      apiKey: this.getApiKeyFromStorage(),
      allowedOrigins: import.meta.env.VITE_ALLOWED_ORIGINS ? 
        import.meta.env.VITE_ALLOWED_ORIGINS.split(',') : 
        ['https://*.github.io', 'http://localhost:*', 'http://127.0.0.1:*'],
      environment,
      enableEncryption: import.meta.env.VITE_ENABLE_API_ENCRYPTION === 'true',
      apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT ?? '10000', 10),
    };
  }

  private static getApiKeyFromStorage(): string | undefined {
    // Only try to get API key from secure storage, never from environment
    try {
      return localStorage.getItem('uva_heesara_api_key') ?? undefined;
    } catch {
      return undefined;
    }
  }

  // Validate current origin against allowed origins
  static isOriginAllowed(): boolean {
    const config = this.getConfig();
    const currentOrigin = window.location.origin;

    // In development, allow all localhost origins
    if (config.environment === 'development') {
      return currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1');
    }

    // In production, check against allowed origins
    return config.allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(currentOrigin);
      }
      return currentOrigin === allowedOrigin;
    });
  }

  // Generate request fingerprint for additional security
  static generateRequestFingerprint(): string {
    const timestamp = Date.now();
    const userAgent = navigator.userAgent;
    const origin = window.location.origin;
    
    // Simple hash function (for basic obfuscation)
    const data = `${timestamp}-${origin}-${userAgent.length}`;
    return btoa(data).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  // Obfuscate API URL (basic security through obscurity)
  static getObfuscatedApiUrl(): string {
    const config = this.getConfig();
    const fingerprint = this.generateRequestFingerprint();
    
    // Add fingerprint as query parameter for basic request tracking
    const separator = config.apiBaseUrl.includes('?') ? '&' : '?';
    return `${config.apiBaseUrl}${separator}_fp=${fingerprint}&_t=${Date.now()}`;
  }
}

// Rate limiting utility
class RateLimiter {
  private static requests: number[] = [];
  private static readonly MAX_REQUESTS = 10; // Max requests per minute
  private static readonly TIME_WINDOW = 60000; // 1 minute

  static canMakeRequest(): boolean {
    const now = Date.now();
    
    // Remove old requests outside the time window
    this.requests = this.requests.filter(time => now - time < this.TIME_WINDOW);
    
    // Check if we're under the limit
    if (this.requests.length >= this.MAX_REQUESTS) {
      console.warn('Rate limit exceeded. Please wait before making more requests.');
      return false;
    }

    // Add current request
    this.requests.push(now);
    return true;
  }

  static getWaitTime(): number {
    if (this.requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...this.requests);
    const waitTime = this.TIME_WINDOW - (Date.now() - oldestRequest);
    
    return Math.max(0, waitTime);
  }
}

// Request validator
class RequestValidator {
  static validateRequest(): { valid: boolean; reason?: string } {
    // Check origin
    if (!ConfigManager.isOriginAllowed()) {
      return {
        valid: false,
        reason: 'Unauthorized origin. This application is not allowed to access the API from this domain.'
      };
    }

    // Check rate limiting
    if (!RateLimiter.canMakeRequest()) {
      const waitTime = Math.ceil(RateLimiter.getWaitTime() / 1000);
      return {
        valid: false,
        reason: `Rate limit exceeded. Please wait ${waitTime} seconds before making another request.`
      };
    }

    return { valid: true };
  }
}

export { ConfigManager, RateLimiter, RequestValidator };
