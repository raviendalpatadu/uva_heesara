// Security configuration and utilities
import { RuntimeConfigLoader } from './runtimeConfig';

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

  static async getConfig(): Promise<SecurityConfig> {
    if (this.config) return this.config;
    
    // Load from the centralized runtime config
    const runtimeConfig = await RuntimeConfigLoader.loadConfig();
    
    this.config = {
      apiBaseUrl: runtimeConfig.apiBaseUrl,
      apiKey: this.getApiKeyFromStorage(),
      allowedOrigins: runtimeConfig.allowedOrigins,
      environment: runtimeConfig.environment,
      enableEncryption: runtimeConfig.enableEncryption,
      apiTimeout: runtimeConfig.apiTimeout,
    };
    
    return this.config;
  }

  /**
   * @deprecated Use getConfig() instead for async loading
   */
  private static loadConfig(): SecurityConfig {
    // Fallback for legacy code - should not be used
    console.warn('Using deprecated synchronous config loading');
    return {
      apiBaseUrl: '',
      apiKey: this.getApiKeyFromStorage(),
      allowedOrigins: ['https://*.github.io', 'http://localhost:*', 'http://127.0.0.1:*', "https://uvaheesara.uvaarchery.lk"],
      environment: 'development',
      enableEncryption: false,
      apiTimeout: 10000,
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
  static async isOriginAllowed(): Promise<boolean> {
    const config = await this.getConfig();
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
  static async getObfuscatedApiUrl(): Promise<string> {
    const config = await this.getConfig();
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
  static async validateRequest(): Promise<{ valid: boolean; reason?: string }> {
    // Check origin
    if (!(await ConfigManager.isOriginAllowed())) {
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
