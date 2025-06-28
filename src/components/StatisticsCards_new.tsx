import React, { useState } from 'react';
import { Users, UserCheck, Target, Building } from 'lucide-react';
import type { EventStatistics } from '../types';
import StatisticsModal from './StatisticsModal';

interface StatisticsCardsProps {
  statistics: EventStatistics;
}

type ModalType = 'total' | 'male' | 'female' | 'events' | 'clubs' | null;

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ statistics }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);

  const handleCardClick = (type: ModalType) => {
    setModalType(type);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
  };

  const stats = [
    {
      title: 'Total Participants',
      value: statistics.totalParticipants,
      icon: Users,
      color: 'text-tournament-blue',
      bgColor: 'bg-blue-50',
      modalType: 'total' as ModalType,
    },
    {
      title: 'Male Participants',
      value: statistics.maleParticipants,
      icon: UserCheck,
      color: 'text-tournament-teal',
      bgColor: 'bg-teal-50',
      modalType: 'male' as ModalType,
    },
    {
      title: 'Female Participants',
      value: statistics.femaleParticipants,
      icon: UserCheck,
      color: 'text-tournament-orange',
      bgColor: 'bg-orange-50',
      modalType: 'female' as ModalType,
    },
    {
      title: 'Total Events (Men/Women)',
      value: Object.keys(statistics.eventBreakdown).length,
      icon: Target,
      color: 'text-tournament-navy',
      bgColor: 'bg-indigo-50',
      modalType: 'events' as ModalType,
    },
    {
      title: 'Participating Clubs',
      value: Object.keys(statistics.clubBreakdown).length,
      icon: Building,
      color: 'text-tournament-yellow',
      bgColor: 'bg-yellow-50',
      modalType: 'clubs' as ModalType,
    },
  ];

  return (
    <>
      <div className="stats-grid mb-6 sm:mb-8">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div 
              key={stat.title} 
              className="stat-card cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
              onClick={() => handleCardClick(stat.modalType)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(stat.modalType);
                }
              }}
              aria-label={`View details for ${stat.title}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="responsive-text font-medium text-gray-600 mb-1 truncate">
                    {stat.title}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Click for details</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-full ${stat.bgColor} flex-shrink-0 ml-3`}>
                  <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <StatisticsModal
        isOpen={modalOpen}
        onClose={closeModal}
        modalType={modalType}
        statistics={statistics}
      />
    </>
  );
};

export default StatisticsCards;
