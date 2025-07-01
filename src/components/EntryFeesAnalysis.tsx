import React, { useMemo } from 'react';
import { DollarSign, Users, Calculator, TrendingUp, Building2, AlertCircle } from 'lucide-react';
import type { Archer } from '../types';

interface EntryFeesAnalysisProps {
  archers: Archer[];
}

interface ClubFeeBreakdown {
  clubName: string;
  participants: number;
  singleEventParticipants: number;
  doubleEventParticipants: number;
  invalidEntries: number;
  totalFees: number;
  feeBreakdown: {
    singleEventFees: number;
    extraEventFees: number;
  };
  participantsList: {
    name: string;
    events: string[];
    isU10U12: boolean;
    isInvalid: boolean;
    fee: number;
  }[];
}

const EntryFeesAnalysis: React.FC<EntryFeesAnalysisProps> = ({ archers }) => {
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
          return { isValid: false, issue: `Over 40 event requires DOB on or before 31/12/1984` };
        }
        return { isValid: true };
      }
      
      // All other events - must be born on or after the cutoff
      if (dob < cutoffDate) {
        const eventType = getEventTypeName(eventName);
        return { isValid: false, issue: `${eventType} event requires DOB on or after ${cutoffDate.toLocaleDateString()}` };
      }
      
      return { isValid: true };
    } catch (error) {
      console.warn('Error validating age for event:', eventName, dobString, error);
      return { isValid: true }; // Don't invalidate if we can't parse the date
    }
  };

  // Calculate fees for each archer
  const calculateArcherFee = (archer: Archer): number => {
    const hasExtraEvent = archer.extraEvent && archer.extraEvent.trim() !== '';
    
    // Always calculate based on events, regardless of age
    return hasExtraEvent ? SINGLE_EVENT_FEE + EXTRA_EVENT_FEE : SINGLE_EVENT_FEE;
  };

  // Check if entry is valid (U10/U12 can only have one event + age category validation)
  const isValidEntry = (archer: Archer): boolean => {
    const hasExtraEvent = archer.extraEvent && archer.extraEvent.trim() !== '';
    const isUnderAge = isU10U12(archer);
    
    // U10/U12 archers should not have extra events
    if (isUnderAge && hasExtraEvent) {
      return false;
    }
    
    // Age category validation if DOB is available
    if (archer.dateOfBirth) {
      // Validate primary event age requirement
      if (archer.primaryEvent) {
        const primaryValidation = validateEventAgeRequirement(archer.primaryEvent, archer.dateOfBirth);
        if (!primaryValidation.isValid) {
          return false;
        }
      }
      
      // Validate extra event age requirement
      if (archer.extraEvent) {
        const extraValidation = validateEventAgeRequirement(archer.extraEvent, archer.dateOfBirth);
        if (!extraValidation.isValid) {
          return false;
        }
      }
    }
    
    return true;
  };

  // Calculate club-wise breakdown
  const clubBreakdown = useMemo((): ClubFeeBreakdown[] => {
    const clubMap = new Map<string, ClubFeeBreakdown>();

    archers.forEach(archer => {
      const clubName = archer.club || 'Unknown Club';
      const hasExtraEvent = archer.extraEvent && archer.extraEvent.trim() !== '';
      const isUnderAge = isU10U12(archer);
      const isInvalid = !isValidEntry(archer);
      const archerFee = calculateArcherFee(archer);

      if (!clubMap.has(clubName)) {
        clubMap.set(clubName, {
          clubName,
          participants: 0,
          singleEventParticipants: 0,
          doubleEventParticipants: 0,
          invalidEntries: 0,
          totalFees: 0,
          feeBreakdown: {
            singleEventFees: 0,
            extraEventFees: 0,
          },
          participantsList: [],
        });
      }

      const club = clubMap.get(clubName);
      if (!club) return;
      
      club.participants += 1;
      club.totalFees += archerFee;

      // Track participant details
      const events = [archer.primaryEvent];
      if (hasExtraEvent && archer.extraEvent) {
        events.push(archer.extraEvent);
      }

      club.participantsList.push({
        name: archer.name,
        events,
        isU10U12: isUnderAge,
        isInvalid,
        fee: archerFee,
      });

      // Count event participation and validation
      if (isInvalid) {
        club.invalidEntries += 1;
      } else if (hasExtraEvent) {
        club.doubleEventParticipants += 1;
        club.feeBreakdown.singleEventFees += SINGLE_EVENT_FEE;
        club.feeBreakdown.extraEventFees += EXTRA_EVENT_FEE;
      } else {
        club.singleEventParticipants += 1;
        club.feeBreakdown.singleEventFees += SINGLE_EVENT_FEE;
      }
    });

    return Array.from(clubMap.values()).sort((a, b) => b.totalFees - a.totalFees);
  }, [archers, isValidEntry]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const totalParticipants = archers.length;
    const totalFees = clubBreakdown.reduce((sum, club) => sum + club.totalFees, 0);
    const singleEventTotal = clubBreakdown.reduce((sum, club) => sum + club.singleEventParticipants, 0);
    const doubleEventTotal = clubBreakdown.reduce((sum, club) => sum + club.doubleEventParticipants, 0);
    const invalidEntriesTotal = clubBreakdown.reduce((sum, club) => sum + club.invalidEntries, 0);
    const totalClubs = clubBreakdown.length;

    return {
      totalParticipants,
      totalFees,
      singleEventTotal,
      doubleEventTotal,
      invalidEntriesTotal,
      totalClubs,
      averageFeePerParticipant: totalParticipants > 0 ? totalFees / totalParticipants : 0,
      averageFeePerClub: totalClubs > 0 ? totalFees / totalClubs : 0,
    };
  }, [clubBreakdown, archers.length]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Calculator className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Entry Fees Analysis</h2>
            <p className="text-gray-600 mt-1">
              Calculate expected revenue from participant registrations
            </p>
          </div>
        </div>

        {/* Fee Structure Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Fee Structure & Age Category Validation Rules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-gray-900">Single Event</div>
              <div className="text-green-600 font-bold">{formatCurrency(SINGLE_EVENT_FEE)}</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-gray-900">Extra Event</div>
              <div className="text-orange-600 font-bold">{formatCurrency(EXTRA_EVENT_FEE)} additional</div>
            </div>
            <div className="bg-white p-3 rounded border border-red-200">
              <div className="font-medium text-red-900">U10 & U12 Rule</div>
              <div className="text-red-600 font-bold text-xs">Single event only allowed</div>
            </div>
            <div className="bg-white p-3 rounded border border-amber-200">
              <div className="font-medium text-amber-900">Max Events</div>
              <div className="text-amber-600 font-bold text-xs">2 events per participant</div>
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

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(overallStats.totalFees)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Participants</p>
              <p className="text-2xl font-bold text-blue-600">{overallStats.totalParticipants}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Participating Clubs</p>
              <p className="text-2xl font-bold text-purple-600">{overallStats.totalClubs}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Fee/Participant</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(overallStats.averageFeePerParticipant)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Participation Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Participation Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{overallStats.singleEventTotal}</div>
            <div className="text-sm text-gray-600">Single Event Only</div>
            <div className="text-xs text-green-600 font-medium">
              {formatCurrency(overallStats.singleEventTotal * SINGLE_EVENT_FEE)}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{overallStats.doubleEventTotal}</div>
            <div className="text-sm text-gray-600">Double Events</div>
            <div className="text-xs text-green-600 font-medium">
              {formatCurrency(overallStats.doubleEventTotal * (SINGLE_EVENT_FEE + EXTRA_EVENT_FEE))}
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600">{overallStats.invalidEntriesTotal}</div>
            <div className="text-sm text-red-600">Invalid Entries</div>
            <div className="text-xs text-red-500 font-medium">
              U10/U12 with multiple events
            </div>
          </div>
        </div>
      </div>

      {/* Club-wise Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Club-wise Fee Analysis</h3>
          <p className="text-sm text-gray-600 mt-1">Expected revenue from each participating club</p>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Club Name
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Single Event
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Double Events
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invalid Entries
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Fees
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clubBreakdown.map((club, index) => (
                <tr key={club.clubName} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {club.clubName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm font-semibold text-gray-900">{club.participants}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm text-gray-900">{club.singleEventParticipants}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm text-gray-900">{club.doubleEventParticipants}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={`text-sm ${club.invalidEntries > 0 ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                      {club.invalidEntries}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-bold text-green-600">
                      {formatCurrency(club.totalFees)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-6 py-3 text-sm font-bold text-gray-900">Total</td>
                <td className="px-6 py-3 text-center text-sm font-bold text-gray-900">
                  {overallStats.totalParticipants}
                </td>
                <td className="px-6 py-3 text-center text-sm font-bold text-gray-900">
                  {overallStats.singleEventTotal}
                </td>
                <td className="px-6 py-3 text-center text-sm font-bold text-gray-900">
                  {overallStats.doubleEventTotal}
                </td>
                <td className="px-6 py-3 text-center text-sm font-bold text-red-600">
                  {overallStats.invalidEntriesTotal}
                </td>
                <td className="px-6 py-3 text-right text-sm font-bold text-green-600">
                  {formatCurrency(overallStats.totalFees)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-200">
          {clubBreakdown.map((club, index) => (
            <div key={club.clubName} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-semibold text-gray-900">
                      {club.clubName}
                    </div>
                  </div>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(club.totalFees)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Participants</div>
                  <div className="font-semibold text-gray-900">{club.participants}</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Single Event</div>
                  <div className="font-semibold text-gray-900">{club.singleEventParticipants}</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Double Events</div>
                  <div className="font-semibold text-gray-900">{club.doubleEventParticipants}</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Invalid Entries</div>
                  <div className={`font-semibold ${club.invalidEntries > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {club.invalidEntries}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Mobile Total Summary */}
          <div className="p-4 bg-gray-50 border-t-2 border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-gray-900">Total Summary</div>
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(overallStats.totalFees)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white p-2 rounded border">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Participants</div>
                <div className="font-bold text-gray-900">{overallStats.totalParticipants}</div>
              </div>
              <div className="bg-white p-2 rounded border">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Single Event</div>
                <div className="font-bold text-gray-900">{overallStats.singleEventTotal}</div>
              </div>
              <div className="bg-white p-2 rounded border">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Double Events</div>
                <div className="font-bold text-gray-900">{overallStats.doubleEventTotal}</div>
              </div>
              <div className="bg-white p-2 rounded border">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Invalid Entries</div>
                <div className="font-bold text-red-600">{overallStats.invalidEntriesTotal}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryFeesAnalysis;
