"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { YearCounts, MagnitudeThreshold } from "@/types/earthquake";
import {
  calculateStats,
  getCountForThreshold,
  thresholdLabel,
} from "@/lib/earthquakeStats";

export default function EarthquakeChart({
  years,
  currentYear,
  threshold,
}: {
  years: YearCounts[];
  currentYear: number;
  threshold: MagnitudeThreshold;
}) {
  const stats = calculateStats(years, currentYear, threshold);

  const data = years.map((y) => ({
    year: y.year,
    count: getCountForThreshold(y, threshold),
    isCurrent: y.year === currentYear,
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        {thresholdLabel(threshold)} Earthquakes by Year (YTD)
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Historical average: {stats.mean} (excluding current year)
      </p>
      <div className="w-full" style={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 13,
              }}
              formatter={(value) => [value, thresholdLabel(threshold)]}
              labelFormatter={(label) => `Year: ${label}`}
            />
            <ReferenceLine
              y={stats.mean}
              stroke="#9ca3af"
              strokeDasharray="6 4"
              label={{
                value: `Avg: ${stats.mean}`,
                position: "right",
                fill: "#6b7280",
                fontSize: 12,
              }}
            />
            <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={48}>
              {data.map((entry) => (
                <Cell
                  key={entry.year}
                  fill={entry.isCurrent ? "#1d4ed8" : "#cbd5e1"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
