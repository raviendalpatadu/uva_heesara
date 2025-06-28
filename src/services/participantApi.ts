// API service for fetching participant data from Google Apps Script
import { ConfigManager, RequestValidator } from '../utils/security';

export interface ApiParticipant {
  Name: string;
  DOB: string;
  Gender: 'Male' | 'Female';
  Contact: string | number;
  Club: string;
  Event: string;
  ExtraEvent?: string;
}

const API_URL = ConfigManager.getConfig().apiBaseUrl;

export class ParticipantApiService {
  /**
   * Fetch participants from Google Apps Script API with security validation and CORS handling
   */
  static async fetchParticipants(): Promise<ApiParticipant[]> {
    // Validate request security
    const validation = RequestValidator.validateRequest();
    if (!validation.valid) {
      throw new Error(`Security validation failed: ${validation.reason}`);
    }

    // Try multiple approaches to handle CORS
    const approaches = [
      // Approach 1: Secure request with obfuscated URL
      () => this.fetchWithSecureURL(),
      // Approach 2: Standard CORS request with timestamp
      () => this.fetchWithCORS(`?_t=${Date.now()}`),
      // Approach 3: Try with minimal headers
      () => this.fetchWithMinimalHeaders(),
    ];

    for (let i = 0; i < approaches.length; i++) {
      try {
        console.log(`Trying secure fetch approach ${i + 1}...`);
        const data = await approaches[i]();
        console.log(`Fetch approach ${i + 1} successful`);
        return data;
      } catch (error) {
        console.warn(`Fetch approach ${i + 1} failed:`, error);
        if (i === approaches.length - 1) {
          throw new Error(`All fetch attempts failed. Last error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nTo fix this CORS issue:\n1. Ensure your Google Apps Script is deployed as a web app\n2. Set permissions to "Anyone can access"\n3. Set execution as "User accessing the web app"`);
        }
      }
    }
    
    throw new Error('All fetch approaches failed');
  }

  /**
   * Secure fetch with obfuscated URL
   */
  private static async fetchWithSecureURL(): Promise<ApiParticipant[]> {
    const secureUrl = ConfigManager.getObfuscatedApiUrl();
    const config = ConfigManager.getConfig();
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    // Add API key if available
    if (config.apiKey) {
      headers['X-API-Key'] = config.apiKey;
    }

    const response = await fetch(secureUrl, {
      method: 'GET',
      mode: 'cors',
      headers,
      signal: AbortSignal.timeout(config.apiTimeout),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiParticipant[] = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format received from API');
    }

    return data;
  }

  /**
   * Standard CORS fetch
   */
  private static async fetchWithCORS(queryParams = ''): Promise<ApiParticipant[]> {
    const response = await fetch(`${API_URL}${queryParams}`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiParticipant[] = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format received from API');
    }

    return data;
  }

  /**
   * Minimal headers approach
   */
  private static async fetchWithMinimalHeaders(): Promise<ApiParticipant[]> {
    const response = await fetch(API_URL, {
      method: 'GET',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiParticipant[] = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format received from API');
    }

    return data;
  }

  /**
   * Calculate age from date of birth
   */
  static calculateAge(dob: string): number | undefined {
    try {
      const parsedDate = this.parseDate(dob);
      if (!parsedDate) return undefined;

      const today = new Date();
      let age = today.getFullYear() - parsedDate.getFullYear();
      const monthDiff = today.getMonth() - parsedDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsedDate.getDate())) {
        age--;
      }

      // Return undefined for unrealistic ages
      return age >= 0 && age <= 100 ? age : undefined;
    } catch (error) {
      console.warn('Error calculating age for DOB:', dob, error);
      return undefined;
    }
  }

  /**
   * Parse different date formats
   */
  private static parseDate(dob: string): Date | undefined {
    // Handle ISO format: "2011-04-17T18:30:00.000Z"
    if (dob.includes('T')) {
      return new Date(dob);
    }

    // Handle slash format: "19/01/2018"
    if (dob.includes('/')) {
      return this.parseDateWithSeparator(dob, '/');
    }

    // Handle dot format: "29.12.2008"
    if (dob.includes('.')) {
      return this.parseDateWithSeparator(dob, '.');
    }

    return undefined;
  }

  /**
   * Parse date with specific separator
   */
  private static parseDateWithSeparator(dob: string, separator: string): Date | undefined {
    const [day, month, year] = dob.split(separator);
    let fullYear = parseInt(year);
    
    // Handle 2-digit years (assuming 20xx for years <= 50, 19xx for years > 50)
    if (fullYear < 100) {
      fullYear = fullYear <= 50 ? 2000 + fullYear : 1900 + fullYear;
    }
    
    const parsedDate = new Date(fullYear, parseInt(month) - 1, parseInt(day));
    return isNaN(parsedDate.getTime()) ? undefined : parsedDate;
  }
}
