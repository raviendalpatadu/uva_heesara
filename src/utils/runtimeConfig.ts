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
    if (this.configPromise) return this.configPromise;

    this.configPromise = this.fetchRuntimeConfig();
    this.config = await this.configPromise;
    return this.config;
  }

  private static async fetchRuntimeConfig(): Promise<RuntimeConfig> {
    // Try to load from multiple sources in order of preference
    const sources = [
      () => this.loadFromConfigEndpoint(),
      () => this.loadFromLocalStorage(),
      () => this.loadFromEnvironment(),
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
   * Load from environment variables (development only)
   */
  private static async loadFromEnvironment(): Promise<RuntimeConfig | null> {
    // Only use env vars in development
    if (window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1') {
      return null;
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    
    if (!apiBaseUrl) {
      return null;
    }

    return {
      apiBaseUrl,
      environment: 'development',
      allowedOrigins: ['http://localhost:*', 'http://127.0.0.1:*'],
      enableEncryption: false,
      apiTimeout: 10000,
    };
  }

  /**
   * Load default configuration (fallback)
   */
  private static async loadFromDefaults(): Promise<RuntimeConfig> {
    // Show configuration dialog if no config is found
    return this.promptForConfiguration();
  }

  /**
   * Prompt user to provide configuration
   */
  private static async promptForConfiguration(): Promise<RuntimeConfig> {
    const apiUrl = prompt(
      'Please enter your Google Apps Script URL:\n\n' +
      'Go to script.google.com, deploy your script as a web app, and paste the URL here.'
    );

    if (!apiUrl) {
      throw new Error('Configuration required to proceed');
    }

    const config: RuntimeConfig = {
      apiBaseUrl: apiUrl,
      environment: 'production',
      allowedOrigins: [window.location.origin],
      enableEncryption: false,
      apiTimeout: 10000,
    };

    // Save to localStorage for future use
    localStorage.setItem('uva_heesara_config', JSON.stringify(config));

    return config;
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
