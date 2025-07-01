import Papa from 'papaparse';
import type { Archer, EventStatistics, DashboardData } from '../types';
import { ParticipantApiService } from '../services/participantApi';
import { DataTransformer } from './dataTransformer';

export const parseCSVData = (csvContent: string): Promise<Archer[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const archers = results.data
            .map((row: any, index: number): Archer | null => {
              if (!row.Name || row.Name.trim() === '') return null;
              
              return {
                id: `archer-${index}`,
                name: row.Name?.trim() || '',
                dateOfBirth: row.DOB?.trim() || '',
                age: calculateAge(row.DOB),
                gender: (row.Gender?.trim() === 'Male' || row.Gender?.trim() === 'Female') 
                  ? row.Gender.trim() as 'Male' | 'Female' 
                  : 'Male',
                contact: row.Contact?.trim() || '',
                club: row.Club?.trim() || 'Individual',
                bowSharing: row['Bow Sharing']?.trim() || undefined,
                primaryEvent: row['Event ']?.trim() || row.Event?.trim() || 'Unknown',
                extraEvent: row['extra event']?.trim() || undefined,
              };
            })
            .filter((archer): archer is Archer => archer !== null);
            
          resolve(archers);
        } catch (error) {
          reject(new Error('Failed to parse CSV data: ' + (error as Error).message));
        }
      },
      error: (error: any) => {
        reject(new Error('CSV parsing error: ' + error.message));
      }
    });
  });
};

export const calculateAge = (dateOfBirth: string): number | undefined => {
  // Use the same age calculation logic as ParticipantApiService
  return ParticipantApiService.calculateAge(dateOfBirth);
};

export const calculateStatistics = (archers: Archer[]): EventStatistics => {
  const totalParticipants = archers.length;
  const maleParticipants = archers.filter(a => a.gender === 'Male').length;
  const femaleParticipants = archers.filter(a => a.gender === 'Female').length;
  
  const eventBreakdown: Record<string, number> = {};
  const clubBreakdown: Record<string, number> = {};
  const ageCategoryBreakdown: Record<string, number> = {};
  const eventGenderBreakdown: Record<string, { Male: number; Female: number }> = {};
  
  archers.forEach(archer => {
    // Event breakdown - count both primary and extra events
    if (archer.primaryEvent) {
      eventBreakdown[archer.primaryEvent] = (eventBreakdown[archer.primaryEvent] || 0) + 1;
      
      // Initialize event gender breakdown if not exists
      if (!eventGenderBreakdown[archer.primaryEvent]) {
        eventGenderBreakdown[archer.primaryEvent] = { Male: 0, Female: 0 };
      }
      eventGenderBreakdown[archer.primaryEvent][archer.gender]++;
    }
    
    // Also count extra events if they exist
    if (archer.extraEvent && archer.extraEvent.trim() !== '') {
      eventBreakdown[archer.extraEvent] = (eventBreakdown[archer.extraEvent] || 0) + 1;
      
      // Initialize event gender breakdown if not exists
      if (!eventGenderBreakdown[archer.extraEvent]) {
        eventGenderBreakdown[archer.extraEvent] = { Male: 0, Female: 0 };
      }
      eventGenderBreakdown[archer.extraEvent][archer.gender]++;
    }
    
    // Club breakdown
    if (archer.club) {
      clubBreakdown[archer.club] = (clubBreakdown[archer.club] || 0) + 1;
    }
    
    // Age category breakdown
    const ageCategory = getAgeCategory(archer.age);
    ageCategoryBreakdown[ageCategory] = (ageCategoryBreakdown[ageCategory] || 0) + 1;
  });
  
  return {
    totalParticipants,
    maleParticipants,
    femaleParticipants,
    eventBreakdown,
    clubBreakdown,
    ageCategoryBreakdown,
    eventGenderBreakdown,
  };
};

export const getAgeCategory = (age?: number): string => {
  if (!age) return 'Unknown';
  
  // Add validation for unrealistic ages
  if (age < 0 || age > 100) {
    return 'Unknown';
  }
  
  // Use age-based categorization based on the proper cutoffs
  if (age <= 9) return 'U10';
  if (age <= 11) return 'U12';
  if (age <= 13) return 'U14';
  if (age <= 16) return 'U17/Cadet';
  if (age <= 20) return 'U21/Junior';
  if (age >= 40) return 'Over 40';
  return 'Open/Adult';
};

export const loadDashboardData = async (file: File): Promise<DashboardData> => {
  const csvContent = await file.text();
  const archers = await parseCSVData(csvContent);
  const statistics = calculateStatistics(archers);
  
  return {
    archers,
    statistics,
    lastUpdated: new Date(),
  };
};

export const loadDefaultData = async (): Promise<DashboardData> => {
  try {
    // Try to load the CSV file from the data folder
    const response = await fetch('/data/entries.csv');
    if (!response.ok) {
      throw new Error('Could not load default data');
    }
    
    const csvContent = await response.text();
    const archers = await parseCSVData(csvContent);
    const statistics = calculateStatistics(archers);

    return {
      archers,
      statistics,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Failed to load default data:', error);
    return {
      archers: [],
      statistics: {
        totalParticipants: 0,
        maleParticipants: 0,
        femaleParticipants: 0,
        eventBreakdown: {},
        clubBreakdown: {},
        ageCategoryBreakdown: {},
        eventGenderBreakdown: {},
      },
      lastUpdated: new Date(),
    };
  }
};

/**
 * Load dashboard data from Google Apps Script API
 */
export const loadApiData = async (): Promise<DashboardData> => {
  try {
    const apiParticipants = await ParticipantApiService.fetchParticipants();
    const validParticipants = DataTransformer.filterValidParticipants(apiParticipants);
    const archers = DataTransformer.transformApiParticipants(validParticipants);
    const statistics = calculateStatistics(archers);

    return {
      archers,
      statistics,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Failed to load API data:', error);
    throw new Error(`Failed to load participant data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
