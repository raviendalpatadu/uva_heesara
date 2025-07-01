import React, { useMemo } from 'react';
import { AlertTriangle, Users, CheckCircle, XCircle, Filter } from 'lucide-react';
import type { Archer } from '../types';

interface EntriesManagementProps {
  archers: Archer[];
}

interface EntryValidation {
  name: string;
  club: string;
  primaryEvent: string;
  extraEvent?: string;
  dateOfBirth?: string;
  isU10U12: boolean;
  isValid: boolean;
  validationIssues: string[];
  expectedCategory?: string;
  fee: number;
}

const EntriesManagement: React.FC<EntriesManagementProps> = ({ archers }) => {
  // Fee constants
  const SINGLE_EVENT_FEE = 4000;
  const EXTRA_EVENT_FEE = 1500;

  // Helper function to check if archer is U10 or U12 based on event registration
  const isU10U12 = (archer: Archer): boolean => {
    // Check if event name contains U10 or U12
    const eventName = archer.primaryEvent?.toLowerCase() || '';
    return eventName.includes('u10') || eventName.includes('u12');
  };

  // Helper function to get age cutoff date for event
  const getEventCutoffDate = (eventName: string): Date | null => {
    const eventLower = eventName.toLowerCase();
    
    if (eventLower.includes('u10')) return new Date('2015-01-01');
    if (eventLower.includes('u12')) return new Date('2013-01-01');
    if (eventLower.includes('u14')) return new Date('2011-01-01');
    if (eventLower.includes('u17') || eventLower.includes('cadet')) return new Date('2008-01-01');
    if (eventLower.includes('u21') || eventLower.includes('junior')) return new Date('2004-01-01');
    if (eventLower.includes('over 40')) return new Date('1984-12-31'); // Special case: before this date
    
    return null; // No age restriction for other events
  };

  // Helper function to get event type name for error messages
  const getEventTypeName = (eventName: string): string => {
    const eventLower = eventName.toLowerCase();
    if (eventLower.includes('u10')) return 'U10';
    if (eventLower.includes('u12')) return 'U12';
    if (eventLower.includes('u14')) return 'U14';
    if (eventLower.includes('u17') || eventLower.includes('cadet')) return 'U17/Cadet';
    return 'U21/Junior';
  };

  // Helper function to validate if archer's DOB meets the age criteria for their registered event
  const validateEventAgeRequirement = (eventName: string, dobString: string): { isValid: boolean; issue?: string } => {
    if (!dobString) return { isValid: true }; // Can't validate without DOB
    
    try {
      const dob = new Date(dobString);
      const cutoffDate = getEventCutoffDate(eventName);
      
      if (!cutoffDate) return { isValid: true }; // No age restriction
      
      const eventLower = eventName.toLowerCase();
      
      // Special case for Over 40 - must be born on or before the cutoff
      if (eventLower.includes('over 40')) {
        if (dob > cutoffDate) {
          return { 
            isValid: false, 
            issue: `Over 40 event requires DOB on or before 31/12/1984, but participant was born ${dob.toLocaleDateString()}` 
          };
        }
        return { isValid: true };
      }
      
      // All other events - must be born on or after the cutoff
      if (dob < cutoffDate) {
        const eventType = getEventTypeName(eventName);
        return { 
          isValid: false, 
          issue: `${eventType} event requires DOB on or after ${cutoffDate.toLocaleDateString()}, but participant was born ${dob.toLocaleDateString()}` 
        };
      }
      
      return { isValid: true };
    } catch (error) {
      console.warn('Error validating age for event:', eventName, dobString, error);
      return { isValid: true }; // Don't invalidate if we can't parse the date
    }
  };

  // Validate entries and categorize them
  const entriesAnalysis = useMemo(() => {
    const validEntries: EntryValidation[] = [];
    const invalidEntries: EntryValidation[] = [];

    archers.forEach(archer => {
      const hasExtraEvent = archer.extraEvent && archer.extraEvent.trim() !== '';
      const isUnderAge = isU10U12(archer);
      const validationIssues: string[] = [];
      
      // Check validation rules
      // Rule 1: U10/U12 archers can only participate in one event
      if (isUnderAge && hasExtraEvent) {
        validationIssues.push('U10/U12 archers can only participate in one event');
      }

      // Rule 2: Validate age requirements for primary event
      if (archer.dateOfBirth && archer.primaryEvent) {
        const primaryValidation = validateEventAgeRequirement(archer.primaryEvent, archer.dateOfBirth);
        if (!primaryValidation.isValid && primaryValidation.issue) {
          validationIssues.push(primaryValidation.issue);
        }
      }

      // Rule 3: Validate age requirements for extra event
      if (archer.dateOfBirth && archer.extraEvent) {
        const extraValidation = validateEventAgeRequirement(archer.extraEvent, archer.dateOfBirth);
        if (!extraValidation.isValid && extraValidation.issue) {
          validationIssues.push(extraValidation.issue);
        }
      }

      const isValid = validationIssues.length === 0;
      const fee = hasExtraEvent ? SINGLE_EVENT_FEE + EXTRA_EVENT_FEE : SINGLE_EVENT_FEE;

      const entry: EntryValidation = {
        name: archer.name,
        club: archer.club || 'Unknown Club',
        primaryEvent: archer.primaryEvent,
        extraEvent: archer.extraEvent,
        dateOfBirth: archer.dateOfBirth,
        isU10U12: isUnderAge,
        isValid,
        validationIssues,
        expectedCategory: undefined, // We don't calculate expected category anymore
        fee,
      };

      if (isValid) {
        validEntries.push(entry);
      } else {
        invalidEntries.push(entry);
      }
    });

    const sortedValidEntries = [...validEntries].sort((a, b) => a.club.localeCompare(b.club));
    const sortedInvalidEntries = [...invalidEntries].sort((a, b) => a.club.localeCompare(b.club));

    return {
      validEntries: sortedValidEntries,
      invalidEntries: sortedInvalidEntries,
      totalEntries: archers.length,
      validCount: validEntries.length,
      invalidCount: invalidEntries.length,
    };
  }, [archers, validateEventAgeRequirement]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Group entries by club
  const groupByClub = (entries: EntryValidation[]) => {
    const clubGroups = new Map<string, EntryValidation[]>();
    entries.forEach(entry => {
      if (!clubGroups.has(entry.club)) {
        clubGroups.set(entry.club, []);
      }
      const clubGroup = clubGroups.get(entry.club);
      if (clubGroup) {
        clubGroup.push(entry);
      }
    });
    return Array.from(clubGroups.entries()).sort(([a], [b]) => a.localeCompare(b));
  };

  const invalidEntriesByClub = groupByClub(entriesAnalysis.invalidEntries);
  const validEntriesByClub = groupByClub(entriesAnalysis.validEntries);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Entries Management</h2>
            <p className="text-gray-600 mt-1">
              Validate and manage participant registrations
            </p>
          </div>
        </div>

        {/* Entry Validation Rules */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Registration Validation Rules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-gray-900">U10 & U12 Event Limit</div>
              <div className="text-blue-600 text-xs">Only allowed to participate in one event</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-gray-900">Age Requirements</div>
              <div className="text-green-600 text-xs">DOB must meet minimum age for registered events</div>
            </div>
          </div>
          
          <div className="mt-4 bg-white rounded border border-blue-200 overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b">
              <h4 className="font-medium text-blue-900 text-sm">Minimum Age Requirements (Date of Birth)</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 text-xs">
              <div className="p-2 border-r border-b bg-purple-50">
                <div className="font-semibold text-purple-800">U10</div>
                <div className="text-purple-600">≥ 01/01/2015</div>
              </div>
              <div className="p-2 border-r border-b bg-blue-50">
                <div className="font-semibold text-blue-800">U12</div>
                <div className="text-blue-600">≥ 01/01/2013</div>
              </div>
              <div className="p-2 border-r border-b bg-green-50">
                <div className="font-semibold text-green-800">U14</div>
                <div className="text-green-600">≥ 01/01/2011</div>
              </div>
              <div className="p-2 border-r border-b bg-yellow-50">
                <div className="font-semibold text-yellow-800">U17/Cadet</div>
                <div className="text-yellow-600">≥ 01/01/2008</div>
              </div>
              <div className="p-2 border-r border-b bg-orange-50">
                <div className="font-semibold text-orange-800">U21/Junior</div>
                <div className="text-orange-600">≥ 01/01/2004</div>
              </div>
              <div className="p-2 border-b bg-red-50">
                <div className="font-semibold text-red-800">Over 40</div>
                <div className="text-red-600">≤ 31/12/1984</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-blue-600">{entriesAnalysis.totalEntries}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valid Entries</p>
              <p className="text-2xl font-bold text-green-600">{entriesAnalysis.validCount}</p>
              <p className="text-xs text-gray-500">
                {entriesAnalysis.totalEntries > 0 
                  ? Math.round((entriesAnalysis.validCount / entriesAnalysis.totalEntries) * 100) 
                  : 0}% of total
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Invalid Entries</p>
              <p className="text-2xl font-bold text-red-600">{entriesAnalysis.invalidCount}</p>
              <p className="text-xs text-gray-500">
                {entriesAnalysis.totalEntries > 0 
                  ? Math.round((entriesAnalysis.invalidCount / entriesAnalysis.totalEntries) * 100) 
                  : 0}% of total
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Invalid Entries Section */}
      {entriesAnalysis.invalidCount > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-red-200">
          <div className="p-4 md:p-6 border-b border-red-200 bg-red-50">
            <h3 className="text-lg font-semibold text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Invalid Registrations ({entriesAnalysis.invalidCount})
            </h3>
            <p className="text-sm text-red-700 mt-1">
              The following registrations have validation issues that need to be resolved:
            </p>
          </div>
          
          <div className="p-4 md:p-6">
            <div className="space-y-4 md:space-y-6">
              {invalidEntriesByClub.map(([clubName, entries]) => (
                <div key={clubName} className="border border-red-200 rounded-lg p-3 md:p-4 bg-red-50">
                  <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm md:text-base">{clubName} ({entries.length} invalid)</span>
                  </h4>
                  <div className="space-y-3">
                    {entries.map((entry) => (
                      <div key={entry.name} className="bg-white border border-red-200 rounded-lg p-3 md:p-4">
                        {/* Mobile Layout */}
                        <div className="md:hidden">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-gray-900 text-sm">{entry.name}</div>
                            <div className="text-sm font-semibold text-red-600 ml-2">
                              {formatCurrency(entry.fee)}
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-xs">
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-gray-600">Primary:</span>
                              <span className="font-medium text-gray-900">{entry.primaryEvent}</span>
                              {entry.isU10U12 && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  U10/U12
                                </span>
                              )}
                            </div>
                            
                            {entry.extraEvent && (
                              <div className="flex flex-wrap items-center gap-1">
                                <span className="text-gray-600">Extra:</span>
                                <span className="font-medium text-gray-900">{entry.extraEvent}</span>
                              </div>
                            )}
                            
                            {entry.dateOfBirth && (
                              <div className="flex flex-wrap items-center gap-1">
                                <span className="text-gray-600">DOB:</span>
                                <span className="font-medium text-blue-600">
                                  {new Date(entry.dateOfBirth).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="border-t border-red-200 pt-2 mt-2">
                            <div className="text-xs font-medium text-red-900 mb-1">Issues:</div>
                            <div className="space-y-1">
                              {entry.validationIssues.map((issue, index) => (
                                <div key={issue} className="flex items-start gap-1">
                                  <span className="text-xs text-red-700 leading-tight">• {issue}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden md:block">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{entry.name}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                <span className="inline-flex items-center gap-1">
                                  Primary Event: <span className="font-medium">{entry.primaryEvent}</span>
                                  {entry.isU10U12 && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full ml-2">
                                      U10/U12
                                    </span>
                                  )}
                                </span>
                                {entry.dateOfBirth && (
                                  <div className="mt-1">
                                    Date of Birth: <span className="font-medium text-blue-600">
                                      {new Date(entry.dateOfBirth).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {entry.extraEvent && (
                                <div className="text-sm text-gray-600">
                                  Extra Event: <span className="font-medium">{entry.extraEvent}</span>
                                </div>
                              )}
                            </div>
                            <div className="text-sm font-semibold text-red-600">
                              {formatCurrency(entry.fee)}
                            </div>
                          </div>
                          
                          <div className="border-t border-red-200 pt-2 mt-2">
                            <div className="text-sm font-medium text-red-900 mb-1">Validation Issues:</div>
                            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                              {entry.validationIssues.map((issue) => (
                                <li key={issue}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Valid Entries Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-green-200">
        <div className="p-6 border-b border-green-200 bg-green-50">
          <h3 className="text-lg font-semibold text-green-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Valid Registrations ({entriesAnalysis.validCount})
          </h3>
          <p className="text-sm text-green-700 mt-1">
            Club-wise breakdown of valid registrations:
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {validEntriesByClub.map(([clubName, entries]) => (
              <div key={clubName} className="border border-green-200 rounded-lg p-4 bg-green-50">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  {clubName}
                </h4>
                <div className="text-sm text-green-700">
                  <div className="flex justify-between">
                    <span>Participants:</span>
                    <span className="font-semibold">{entries.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Single Events:</span>
                    <span className="font-semibold">
                      {entries.filter(e => !e.extraEvent).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Double Events:</span>
                    <span className="font-semibold">
                      {entries.filter(e => e.extraEvent).length}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-green-300 pt-2 mt-2">
                    <span>Total Fees:</span>
                    <span className="font-bold text-green-800">
                      {formatCurrency(entries.reduce((sum, e) => sum + e.fee, 0))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {validEntriesByClub.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No valid entries found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntriesManagement;
