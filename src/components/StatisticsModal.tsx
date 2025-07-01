import React, { useEffect } from 'react';
import { X, Users, Target, Building, TrendingUp } from 'lucide-react';
import type { EventStatistics } from '../types';

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalType: 'total' | 'male' | 'female' | 'events' | 'clubs' | null;
  statistics: EventStatistics;
}

const StatisticsModal: React.FC<StatisticsModalProps> = ({ 
  isOpen, 
  onClose, 
  modalType, 
  statistics 
}) => {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !modalType) return null;

  const getModalContent = () => {
    switch (modalType) {
      case 'total':
        return {
          title: 'Total Participants',
          icon: Users,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Male Participants</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.maleParticipants}</p>
                  <p className="text-xs text-gray-500">
                    {((statistics.maleParticipants / statistics.totalParticipants) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Female Participants</p>
                  <p className="text-2xl font-bold text-orange-600">{statistics.femaleParticipants}</p>
                  <p className="text-xs text-gray-500">
                    {((statistics.femaleParticipants / statistics.totalParticipants) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Participation Summary
                </h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Total registered participants: {statistics.totalParticipants}</li>
                  <li>• Gender ratio: {((statistics.maleParticipants / statistics.femaleParticipants) || 0).toFixed(2)}:1 (M:F)</li>
                  <li>• Average per club: {(statistics.totalParticipants / Object.keys(statistics.clubBreakdown).length).toFixed(1)}</li>
                </ul>
              </div>
            </div>
          )
        };

      case 'male': {
        const topMaleEvents = Object.entries(statistics.eventGenderBreakdown)
          .map(([event, breakdown]) => ({ event, count: breakdown.Male }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        return {
          title: 'Male Participants',
          icon: Users,
          color: 'text-teal-600',
          bgColor: 'bg-teal-50',
          content: (
            <div className="space-y-4">
              <div className="bg-teal-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Male Participants</p>
                <p className="text-3xl font-bold text-teal-600">{statistics.maleParticipants}</p>
                <p className="text-sm text-gray-500">
                  {((statistics.maleParticipants / statistics.totalParticipants) * 100).toFixed(1)}% of total
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Top Events by Male Participation</h4>
                <div className="space-y-2">
                  {topMaleEvents.map(({ event, count }) => (
                    <div key={event} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <span className="text-sm font-medium">{event}</span>
                      <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded text-sm font-semibold">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        };
      }

      case 'female': {
        const topFemaleEvents = Object.entries(statistics.eventGenderBreakdown)
          .map(([event, breakdown]) => ({ event, count: breakdown.Female }))
          .sort((a, b) => b.count - a.count);

        return {
          title: 'Female Participants',
          icon: Users,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          content: (
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Female Participants</p>
                <p className="text-3xl font-bold text-orange-600">{statistics.femaleParticipants}</p>
                <p className="text-sm text-gray-500">
                  {((statistics.femaleParticipants / statistics.totalParticipants) * 100).toFixed(1)}% of total
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Top Events by Female Participation</h4>
                <div className="space-y-2">
                  {topFemaleEvents.map(({ event, count }) => (
                    <div key={event} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <span className="text-sm font-medium">{event}</span>
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-semibold">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        };
      }

      case 'events': {
        const eventList = Object.entries(statistics.eventBreakdown)
          .sort((a, b) => b[1] - a[1]);

        return {
          title: 'Event Statistics',
          icon: Target,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50',
          content: (
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-3xl font-bold text-indigo-600">{Object.keys(statistics.eventBreakdown).length}</p>
                <p className="text-sm text-gray-500">
                  Avg {(statistics.totalParticipants / Object.keys(statistics.eventBreakdown).length).toFixed(1)} participants per event
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">All Events by Participation</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {eventList.map(([event, count]) => {
                    const genderBreakdown = statistics.eventGenderBreakdown[event];
                    return (
                      <div key={event} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{event}</span>
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-semibold">
                            {count} total
                          </span>
                        </div>
                        {genderBreakdown && (
                          <div className="flex space-x-2 text-xs">
                            <span className="text-blue-600">♂ {genderBreakdown.Male}</span>
                            <span className="text-orange-600">♀ {genderBreakdown.Female}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )
        };
      }

      case 'clubs': {
        const clubList = Object.entries(statistics.clubBreakdown)
          .sort((a, b) => b[1] - a[1]);

        return {
          title: 'Club Statistics',
          icon: Building,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          content: (
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Participating Clubs</p>
                <p className="text-3xl font-bold text-yellow-600">{Object.keys(statistics.clubBreakdown).length}</p>
                <p className="text-sm text-gray-500">
                  Avg {(statistics.totalParticipants / Object.keys(statistics.clubBreakdown).length).toFixed(1)} participants per club
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">All Clubs by Participation</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {clubList.map(([club, count]) => (
                    <div key={club} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                      <span className="text-sm font-medium truncate flex-1 mr-2">{club}</span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-semibold">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        };
      }

      default:
        return null;
    }
  };

  const modalContent = getModalContent();
  if (!modalContent) return null;

  const { title, icon: IconComponent, color, content } = modalContent;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-2 rounded-full ${modalContent.bgColor} mr-3`}>
                  <IconComponent className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(85vh-120px)]">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsModal;
