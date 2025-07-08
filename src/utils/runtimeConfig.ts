// Runtime configuration loader - URLs are loaded at runtime, not build time
export interface RuntimeConfig {
  apiBaseUrl: string;
  environment: 'development' | 'production';
  allowedOrigins: string[];
  enableEncryption: boolean;
  apiTimeout: number;
}

class RuntimeConfigLoader {
  private static config: RuntimeConfig | null = null;
  private static configPromise: Promise<RuntimeConfig> | null = null;

  /**
   * Load configuration at runtime from various sources
   */
  static async loadConfig(): Promise<RuntimeConfig> {
    if (this.config) return this.config;
    if (this.configPromise) return await this.configPromise;

    this.configPromise = this.fetchRuntimeConfig();
    this.config = await this.configPromise;
    return this.config;
  }

  private static async fetchRuntimeConfig(): Promise<RuntimeConfig> {
    // Try to load from multiple sources in order of preference
    const sources = [
      () => this.loadFromEnvironment(), // Always try environment first (GitHub secrets in production)
      () => this.loadFromConfigEndpoint(),
      () => this.loadFromLocalStorage(),
      () => this.loadFromDefaults(),
    ];

    for (const source of sources) {
      try {
        const config = await source();
        if (config) {
          console.log('Configuration loaded successfully');
          return config;
        }
      } catch (error) {
        console.warn('Failed to load from config source:', error);
      }
    }

    throw new Error('Failed to load configuration from any source');
  }

  /**
   * Load from a separate config endpoint (most secure option)
   */
  private static async loadFromConfigEndpoint(): Promise<RuntimeConfig | null> {
    try {
      // This could be a separate GitHub Pages file or external service
      const response = await fetch('./config.json', {
        method: 'GET',
        cache: 'no-cache',
      });

      if (!response.ok) return null;

      const config = await response.json();
      return this.validateConfig(config);
    } catch {
      return null;
    }
  }

  /**
   * Load from localStorage (for user-provided configuration)
   */
  private static async loadFromLocalStorage(): Promise<RuntimeConfig | null> {
    try {
      const stored = localStorage.getItem('uva_heesara_config');
      if (!stored) return null;

      const config = JSON.parse(stored);
      return this.validateConfig(config);
    } catch {
      return null;
    }
  }

  /**
   * Load from environment variables (works in both development and production)
   */
  private static async loadFromEnvironment(): Promise<RuntimeConfig | null> {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    
    if (!apiBaseUrl) {
      console.log('No VITE_API_BASE_URL found in environment variables');
      return null;
    }

    const isProduction = import.meta.env.VITE_ENVIRONMENT === 'production' || 
                        import.meta.env.PROD ||
                        (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');

    let allowedOrigins: string[];
    if (import.meta.env.VITE_ALLOWED_ORIGINS) {
      allowedOrigins = import.meta.env.VITE_ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
    } else if (isProduction) {
      allowedOrigins = [window.location.origin];
    } else {
      allowedOrigins = ['http://localhost:*', 'http://127.0.0.1:*', window.location.origin];
    }

    return {
      apiBaseUrl,
      environment: isProduction ? 'production' : 'development',
      allowedOrigins,
      enableEncryption: import.meta.env.VITE_ENABLE_API_ENCRYPTION === 'true',
      apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT ?? '10000'),
    };
  }

  /**
   * Load default configuration (fallback) - No longer prompts user
   */
  private static async loadFromDefaults(): Promise<RuntimeConfig> {
    throw new Error(
      'Configuration not found. Please ensure VITE_API_BASE_URL is set in your environment variables or GitHub secrets.'
    );
  }

  /**
   * Validate configuration object
   */
  private static validateConfig(config: any): RuntimeConfig | null {
    if (!config || typeof config !== 'object') return null;
    if (!config.apiBaseUrl || typeof config.apiBaseUrl !== 'string') return null;

    return {
      apiBaseUrl: config.apiBaseUrl,
      environment: config.environment === 'development' ? 'development' : 'production',
      allowedOrigins: Array.isArray(config.allowedOrigins) ? config.allowedOrigins : [window.location.origin],
      enableEncryption: Boolean(config.enableEncryption),
      apiTimeout: Number(config.apiTimeout) || 10000,
    };
  }

  /**
   * Reset configuration (for testing or reconfiguration)
   */
  static resetConfig(): void {
    this.config = null;
    this.configPromise = null;
    localStorage.removeItem('uva_heesara_config');
  }
}

export { RuntimeConfigLoader };
