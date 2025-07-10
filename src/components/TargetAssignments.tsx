import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Target, Users, Clock } from 'lucide-react';
import { PageLoading } from './Loading';

interface TargetAssignment {
  "Target No": number;
  "Assign": string;
  "Name": string;
  "Gender": string;
  "Club": string;
  "Com No": string;
}

interface TargetAssignmentData {
  [eventName: string]: TargetAssignment[];
}

interface TargetAssignmentsProps {
  apiBaseUrl: string;
}

const TargetAssignments: React.FC<TargetAssignmentsProps> = ({ apiBaseUrl }) => {
  const [selectedDay, setSelectedDay] = useState<'day1' | 'day2' | 'day3'>('day1');
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  // Fetch target assignment data
  const { data: targetData, isLoading, error, refetch } = useQuery({
    queryKey: ['targetAssignments', selectedDay],
    queryFn: async () => {
      const response = await fetch(`${apiBaseUrl}?endpoint=${selectedDay}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch target assignments: ${response.status} ${response.statusText}`);
      }
      const data: TargetAssignmentData = await response.json();
      return data;
    },
    retry: 1,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    enabled: !!apiBaseUrl, // Only run query if apiBaseUrl is available
  });

  // Show error if no API base URL is provided
  if (!apiBaseUrl) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Configuration Error
        </h3>
        <p className="text-gray-600 mb-4">
          API base URL is not configured. Please check your environment variables.
        </p>
      </div>
    );
  }

  const toggleEventExpansion = (eventName: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventName)) {
        newSet.delete(eventName);
      } else {
        newSet.add(eventName);
      }
      return newSet;
    });
  };

  const getDayLabel = (day: string) => {
    switch (day) {
      case 'day1': return 'Day 1';
      case 'day2': return 'Day 2';
      case 'day3': return 'Day 3';
      default: return day;
    }
  };

  if (isLoading) {
    return <PageLoading message={`Loading ${getDayLabel(selectedDay)} target assignments...`} />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to Load Target Assignments
        </h3>
        <p className="text-gray-600 mb-4">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </p>
        <button 
          onClick={() => refetch()}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!targetData) {
    return <PageLoading message="No target assignment data available..." />;
  }

  const events = Object.keys(targetData);
 
  return (
    <div className="space-y-6">
      {/* Day Selection Tabs - Mobile Optimized */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="-mb-px flex min-w-max sm:min-w-0">
          {(['day1', 'day2', 'day3'] as const).map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-1 py-3 px-2 border-b-2 font-medium text-sm transition-colors duration-200 touch-manipulation select-none active:scale-95 ${
                selectedDay === day
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{getDayLabel(day)}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Events List - Mobile Optimized */}
      <div className="space-y-3 sm:space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Target className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              No Target Assignments Available
            </h3>
            <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              No target assignments found for {getDayLabel(selectedDay)}. Please check back later or try a different day.
            </p>
            <button 
              onClick={() => refetch()}
              className="mt-6 btn-primary"
            >
              Refresh
            </button>
          </div>
        ) : (
          events.map((eventName) => {
            const assignments = targetData[eventName];
            const isExpanded = expandedEvents.has(eventName);
            
            // Group assignments by target number
            const targetGroups = assignments.reduce((acc, assignment) => {
              const targetNo = assignment["Target No"];
              if (!acc[targetNo]) {
                acc[targetNo] = [];
              }
              acc[targetNo].push(assignment);
              return acc;
            }, {} as Record<number, TargetAssignment[]>);

            const sortedTargetNumbers = Object.keys(targetGroups)
              .map(Number)
              .sort((a, b) => a - b);

            return (
              <div key={eventName} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <button
                  onClick={() => toggleEventExpansion(eventName)}
                  className="w-full p-4 sm:px-6 sm:py-4 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-all duration-200 touch-manipulation active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                      <h3 className="text-sm sm:text-lg font-semibold text-gray-900 truncate pr-2">{eventName}</h3>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0">
                        {assignments.length}
                      </span>
                    </div>
                    <ChevronDown 
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                        isExpanded ? 'transform rotate-180' : ''
                      }`} 
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                    <div className="space-y-3 sm:space-y-4">
                      {sortedTargetNumbers.map((targetNo) => {
                        const targetAssignments = targetGroups[targetNo];
                        return (
                          <div key={targetNo} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                            <h4 className="text-sm sm:text-md font-semibold text-gray-900 mb-3 flex items-center">
                              <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-orange-500" />
                              Target {targetNo}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                              {targetAssignments
                                .sort((a, b) => a.Assign.localeCompare(b.Assign))
                                .map((assignment) => (
                                <div key={`${targetNo}-${assignment.Assign}-${assignment.Name}`} className="bg-white rounded-md p-3 border border-gray-200 touch-manipulation active:bg-gray-50 transition-colors duration-150">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                                      {assignment.Assign}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      assignment.Gender === 'Male' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-pink-100 text-pink-800'
                                    }`}>
                                      {assignment.Gender === 'Male' ? 'M' : 'F'}
                                    </span>
                                  </div>
                                  <p className="font-medium text-gray-900 text-xs sm:text-sm mb-1 leading-tight">
                                    {assignment.Name}
                                  </p>
                                  <p className="text-gray-600 text-xs leading-tight">
                                    {assignment.Club}
                                  </p>
                                  {assignment["Com No"] && (
                                    <p className="text-gray-500 text-xs mt-1">
                                      Com: {assignment["Com No"]}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TargetAssignments;
