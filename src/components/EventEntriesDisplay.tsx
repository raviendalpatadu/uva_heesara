import React, { useMemo, useState } from 'react';
import { ChevronDown, Users, Target, Trophy } from 'lucide-react';
import type { Archer } from '../types';

interface EventEntriesDisplayProps {
  archers: Archer[];
}

interface EventEntry {
  event: string;
  participants: {
    male: Archer[];
    female: Archer[];
  };
  totalCount: number;
}

const EventEntriesDisplay: React.FC<EventEntriesDisplayProps> = ({ archers }) => {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  // Group archers by events (including both primary and extra events)
  const eventEntries = useMemo(() => {
    const eventMap = new Map<string, { male: Archer[]; female: Archer[] }>();

    archers.forEach(archer => {
      // Add archer to their primary event
      if (archer.primaryEvent && archer.primaryEvent.trim() !== '') {
        if (!eventMap.has(archer.primaryEvent)) {
          eventMap.set(archer.primaryEvent, { male: [], female: [] });
        }
        const eventData = eventMap.get(archer.primaryEvent)!;
        if (archer.gender === 'Male') {
          eventData.male.push(archer);
        } else {
          eventData.female.push(archer);
        }
      }

      // Add archer to their extra event if they have one
      if (archer.extraEvent && archer.extraEvent.trim() !== '') {
        if (!eventMap.has(archer.extraEvent)) {
          eventMap.set(archer.extraEvent, { male: [], female: [] });
        }
        const eventData = eventMap.get(archer.extraEvent)!;
        if (archer.gender === 'Male') {
          eventData.male.push(archer);
        } else {
          eventData.female.push(archer);
        }
      }
    });

    // Convert to array and sort
    const entries: EventEntry[] = Array.from(eventMap.entries())
      .map(([event, participants]) => ({
        event,
        participants: {
          male: participants.male.sort((a, b) => a.name.localeCompare(b.name)),
          female: participants.female.sort((a, b) => a.name.localeCompare(b.name)),
        },
        totalCount: participants.male.length + participants.female.length,
      }))
      .sort((a, b) => a.event.localeCompare(b.event));

    return entries;
  }, [archers]);

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

  const totalParticipants = archers.length;
  const totalEvents = eventEntries.length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Participants</p>
              <p className="text-3xl font-bold">{totalParticipants}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Events</p>
              <p className="text-3xl font-bold">{totalEvents}</p>
            </div>
            <Target className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Tournament</p>
              <p className="text-xl font-bold">UVA HEESARA 2025</p>
            </div>
            <Trophy className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Event Entries */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Entries</h2>
        
        {eventEntries.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No Event Entries</h3>
            <p className="text-gray-400">Participant data is being loaded...</p>
          </div>
        ) : (
          eventEntries.map((eventEntry) => {
            const isExpanded = expandedEvents.has(eventEntry.event);
            
            return (
              <div key={eventEntry.event} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {/* Event Header */}
                <button
                  onClick={() => toggleEventExpansion(eventEntry.event)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Target className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{eventEntry.event}</h3>
                        <p className="text-sm text-gray-500">
                          {eventEntry.totalCount} participants • 
                          {eventEntry.participants.male.length} male • 
                          {eventEntry.participants.female.length} female
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {eventEntry.totalCount}
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`} />
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Male Participants */}
                      <div>
                        <h4 className="flex items-center space-x-2 text-base font-medium text-blue-800 mb-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Male ({eventEntry.participants.male.length})</span>
                        </h4>
                        {eventEntry.participants.male.length === 0 ? (
                          <p className="text-gray-500 text-sm italic">No male participants</p>
                        ) : (
                          <div className="space-y-2">
                            {eventEntry.participants.male.map((archer, index) => (
                              <div key={`${archer.id}-male`} className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900">{archer.name}</p>
                                    <p className="text-sm text-gray-500">{archer.club}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs text-gray-400">#{index + 1}</div>
                                    {archer.age && (
                                      <div className="text-xs text-gray-500">{archer.age} years</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Female Participants */}
                      <div>
                        <h4 className="flex items-center space-x-2 text-base font-medium text-pink-800 mb-3">
                          <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                          <span>Female ({eventEntry.participants.female.length})</span>
                        </h4>
                        {eventEntry.participants.female.length === 0 ? (
                          <p className="text-gray-500 text-sm italic">No female participants</p>
                        ) : (
                          <div className="space-y-2">
                            {eventEntry.participants.female.map((archer, index) => (
                              <div key={`${archer.id}-female`} className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900">{archer.name}</p>
                                    <p className="text-sm text-gray-500">{archer.club}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs text-gray-400">#{index + 1}</div>
                                    {archer.age && (
                                      <div className="text-xs text-gray-500">{archer.age} years</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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

export default EventEntriesDisplay;
