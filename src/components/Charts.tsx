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
    // Use fullClub if available, otherwise use label
    const displayLabel = payload[0]?.payload?.fullClub || label;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
        <p className="font-medium text-sm break-words">{displayLabel}</p>
        <p className="text-tournament-blue text-sm">
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
    // Use fullEvent if available, otherwise use label
    const displayLabel = payload[0]?.payload?.fullEvent || label;

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
        <p className="font-medium mb-2 text-sm break-words">{displayLabel}</p>
        <div className="space-y-1 text-sm">
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
        event: event.length > 15 ? event.substring(0, 15) + "..." : event, // Shorten for mobile
        fullEvent: event, // Keep full name for tooltip
        count,
        Male: eventParticipants.Male || 0,
        Female: eventParticipants.Female || 0,
      };
    })
    .sort((a, b) => b.count - a.count); // Limit to top 8 events for better mobile display

  // Prepare data for clubs bar chart - only show clubs with participants
  const clubData = Object.entries(statistics.clubBreakdown)
    .filter(([_, count]) => count > 0) // Only include clubs with participants
    .map(([club, count]) => ({
      club: club.length > 15 ? club.substring(0, 15) + "..." : club, // Shorten for mobile
      fullClub: club, // Keep full name for tooltip
      count,
    }))
    .sort((a, b) => b.count - a.count); // Limit to top 8 clubs for better mobile display

  return (
    <div className="charts-grid mb-6 sm:mb-8">
      {/* Gender Distribution */}
      <div className="card chart-card-single">
        <h3 className="chart-title">Gender Distribution</h3>
        <div className="chart-container">          <ResponsiveContainer width="100%" height="100%">
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
                innerRadius="20%"
                fill="#8884d8"
                dataKey="value"
                strokeWidth={2}
                stroke="#fff"
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
              margin={{ top: 20, right: 15, left: 15, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="club"
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
                interval={0}
                tick={{ fontSize: 12, fill: '#374151' }}
              />
              <YAxis 
                fontSize={12} 
                tick={{ fontSize: 12, fill: '#374151' }}
                axisLine={{ stroke: '#d1d5db' }}
                tickLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                fill="#0891b2" 
                radius={[6, 6, 0, 0]}
                stroke="#0891b2"
                strokeWidth={0}
              />
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
              margin={{ top: 20, right: 15, left: 15, bottom: 90 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="event"
                angle={-45}
                textAnchor="end"
                height={110}
                fontSize={12}
                interval={0}
                tick={{ fontSize: 12, fill: '#374151' }}
              />
              <YAxis 
                fontSize={12} 
                tick={{ fontSize: 12, fill: '#374151' }}
                axisLine={{ stroke: '#d1d5db' }}
                tickLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip content={<GenderBarTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }}
                iconSize={14}
              />
              <Bar
                dataKey="Male"
                fill="#2563eb"
                radius={[3, 3, 0, 0]}
                name="Male"
                strokeWidth={0}
              />
              <Bar
                dataKey="Female"
                fill="#ea580c"
                radius={[3, 3, 0, 0]}
                name="Female"
                strokeWidth={0}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;
