export interface Archer {
  id: string;
  name: string;
  dateOfBirth: string;
  age?: number;
  gender: 'Male' | 'Female';
  contact: string;
  club: string;
  bowSharing?: string;
  primaryEvent: string;
  extraEvent?: string;
  ageCategory?: string;
  distance?: string;
}

export interface EventStatistics {
  totalParticipants: number;
  maleParticipants: number;
  femaleParticipants: number;
  eventBreakdown: Record<string, number>;
  clubBreakdown: Record<string, number>;
  ageCategoryBreakdown: Record<string, number>;
  eventGenderBreakdown: Record<string, { Male: number; Female: number }>;
}

export interface DashboardData {
  archers: Archer[];
  statistics: EventStatistics;
  lastUpdated: Date;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
  progress?: number;
}

export interface FileUploadState {
  file: File | null;
  isUploading: boolean;
  uploadProgress: number;
  error?: string;
}
