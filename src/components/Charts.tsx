import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { EventStatistics } from "../types";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium">{label}</p>
        <p className="text-tournament-blue">
          Participants: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-tournament-blue">
          Count: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const GenderBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const maleCount =
      payload.find((p: any) => p.dataKey === "Male")?.value || 0;
    const femaleCount =
      payload.find((p: any) => p.dataKey === "Female")?.value || 0;
    const total = maleCount + femaleCount;

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-blue-600">
            Male: <span className="font-bold">{maleCount}</span>
          </p>
          <p className="text-orange-600">
            Female: <span className="font-bold">{femaleCount}</span>
          </p>
          <hr className="my-1" />
          <p className="text-tournament-blue font-semibold">
            Total: <span className="font-bold">{total}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

interface ChartsProps {
  statistics: EventStatistics;
}

const Charts: React.FC<ChartsProps> = ({ statistics }) => {
  // Prepare data for gender distribution pie chart
  const genderData = [
    { name: "Male", value: statistics.maleParticipants, color: "#2563eb" },
    { name: "Female", value: statistics.femaleParticipants, color: "#ea580c" },
  ];

  // Prepare data for events bar chart with gender breakdown - only show events with participants
  const eventData = Object.entries(statistics.eventBreakdown)
    .filter(([_, count]) => count > 0) // Only include events with participants
    .map(([event, count]) => {
      // Calculate gender breakdown for this specific event
      const eventParticipants = statistics.eventGenderBreakdown?.[event] || {
        Male: 0,
        Female: 0,
      };
      return {
        event,
        count,
        Male: eventParticipants.Male || 0,
        Female: eventParticipants.Female || 0,
      };
    })
    .sort((a, b) => b.count - a.count);

  // Prepare data for clubs bar chart - only show clubs with participants
  const clubData = Object.entries(statistics.clubBreakdown)
    .filter(([_, count]) => count > 0) // Only include clubs with participants
    .map(([club, count]) => ({
      club: club.length > 20 ? club.substring(0, 20) + "..." : club,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="charts-grid mb-6 sm:mb-8">
      {/* Gender Distribution */}
      <div className="card chart-card-single">
        <h3 className="chart-title">Gender Distribution</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                }
                outerRadius="60%"
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Clubs */}
      <div className="card chart-card-single">
        <h3 className="chart-title">Clubs by Participation</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={clubData}
              margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="club"
                angle={-35}
                textAnchor="end"
                height={60}
                fontSize={9}
                interval={0}
                tick={{ fontSize: 9 }}
              />
              <YAxis fontSize={9} tick={{ fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#0891b2" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Events by Gender */}
      <div className="card chart-card-double">
        <h3 className="chart-title">Events by Gender Participation</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={eventData}
              margin={{ top: 10, right: 10, left: 10, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="event"
                angle={-35}
                textAnchor="end"
                height={70}
                fontSize={9}
                interval={0}
                tick={{ fontSize: 9 }}
              />
              <YAxis fontSize={9} tick={{ fontSize: 9 }} />
              <Tooltip content={<GenderBarTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconSize={10}
              />
              <Bar
                dataKey="Male"
                fill="#2563eb"
                radius={[2, 2, 0, 0]}
                name="Male"
              />
              <Bar
                dataKey="Female"
                fill="#ea580c"
                radius={[2, 2, 0, 0]}
                name="Female"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;
