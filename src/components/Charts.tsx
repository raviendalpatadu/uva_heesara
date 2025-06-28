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
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 events

  // Prepare data for clubs bar chart - only show clubs with participants
  const clubData = Object.entries(statistics.clubBreakdown)
    .filter(([_, count]) => count > 0) // Only include clubs with participants
    .map(([club, count]) => ({
      club: club.length > 20 ? club.substring(0, 20) + "..." : club,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Top 8 clubs

  return (
    <div className="charts-grid mb-6 sm:mb-8">
      {/* Gender Distribution */}
      <div className="card">
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
                outerRadius="70%"
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
      <div className="card">
        <h3 className="chart-title">Top Clubs by Participation</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={clubData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="club"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={10}
                interval={0}
              />
              <YAxis fontSize={10} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#0891b2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Events by Gender */}
      <div className="card col-span-2">
        <h3 className="chart-title">Top Events by Gender Participation</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={eventData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="event"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={10}
                interval={0}
              />
              <YAxis fontSize={10} />
              <Tooltip content={<GenderBarTooltip />} />
              <Legend />
              <Bar
                dataKey="Male"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                name="Male"
              />
              <Bar
                dataKey="Female"
                fill="#ea580c"
                radius={[4, 4, 0, 0]}
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
