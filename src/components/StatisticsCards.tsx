import React from 'react';
import { Users, UserCheck, Target, Building } from 'lucide-react';
import type { EventStatistics } from '../types';

interface StatisticsCardsProps {
  statistics: EventStatistics;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ statistics }) => {
  const stats = [
    {
      title: 'Total Participants',
      value: statistics.totalParticipants,
      icon: Users,
      color: 'text-tournament-blue',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Male Participants',
      value: statistics.maleParticipants,
      icon: UserCheck,
      color: 'text-tournament-teal',
      bgColor: 'bg-teal-50',
    },
    {
      title: 'Female Participants',
      value: statistics.femaleParticipants,
      icon: UserCheck,
      color: 'text-tournament-orange',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Total Events',
      value: Object.keys(statistics.eventBreakdown).length,
      icon: Target,
      color: 'text-tournament-navy',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Participating Clubs',
      value: Object.keys(statistics.clubBreakdown).length,
      icon: Building,
      color: 'text-tournament-yellow',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className="stats-grid mb-6 sm:mb-8">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div key={stat.title} className="stat-card">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="responsive-text font-medium text-gray-600 mb-1 truncate">
                  {stat.title}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`p-2 sm:p-3 rounded-full ${stat.bgColor} flex-shrink-0 ml-3`}>
                <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatisticsCards;
