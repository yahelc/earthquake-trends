"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import { Earthquake, MagnitudeThreshold, YearCounts } from "@/types/earthquake";
import { getCountForThreshold } from "@/lib/earthquakeStats";

interface DayData {
  dayOfYear: number;
  dateLabel: string;
  current?: number;
  median?: number;
  p25?: number;
  p75?: number;
}

function getDayOfYear(date: Date): number {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return (
    Math.floor(
      (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1
  );
}

function getMonthDayLabel(dayOfYear: number): string {
  // Use 2024 (leap year) as reference to get month/day labels
  const d = new Date(Date.UTC(2024, 0, 1));
  d.setUTCDate(d.getUTCDate() + dayOfYear - 1);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function CumulativeChart({
  currentYearEvents,
  allYearEvents,
  currentYear,
  cutoffDate,
  threshold,
}: {
  currentYearEvents: Earthquake[];
  allYearEvents: Map<number, Earthquake[]>;
  currentYear: number;
  cutoffDate: string;
  threshold: MagnitudeThreshold;
}) {
  const cutoff = new Date(cutoffDate + "T00:00:00Z");
  const maxDay = getDayOfYear(cutoff);

  // Filter current year events by threshold
  const currentFiltered = currentYearEvents
    .filter((e) => e.magnitude >= threshold)
    .sort((a, b) => a.time - b.time);

  // Build cumulative for current year
  const currentCumulative = new Map<number, number>();
  let cumCount = 0;
  for (const e of currentFiltered) {
    const d = new Date(e.time);
    const day = getDayOfYear(d);
    cumCount++;
    currentCumulative.set(day, cumCount);
  }

  // Build cumulative for historical years
  const historicalYears = Array.from(allYearEvents.keys()).filter(
    (y) => y !== currentYear
  );

  const historicalCumulatives: Map<number, number>[] = [];
  for (const year of historicalYears) {
    const events = (allYearEvents.get(year) || [])
      .filter((e) => e.magnitude >= threshold)
      .sort((a, b) => a.time - b.time);
    const cum = new Map<number, number>();
    let c = 0;
    for (const e of events) {
      const d = new Date(e.time);
      const day = getDayOfYear(d);
      c++;
      cum.set(day, c);
    }
    historicalCumulatives.push(cum);
  }

  // Build day-by-day data
  const data: DayData[] = [];

  // Sample every 3 days to keep data manageable
  for (let day = 1; day <= maxDay; day += 3) {
    // Current year cumulative
    let currentVal = 0;
    for (let d = day; d >= 1; d--) {
      if (currentCumulative.has(d)) {
        currentVal = currentCumulative.get(d)!;
        break;
      }
    }

    // Historical values at this day
    const histValues: number[] = [];
    for (const cum of historicalCumulatives) {
      let val = 0;
      for (let d = day; d >= 1; d--) {
        if (cum.has(d)) {
          val = cum.get(d)!;
          break;
        }
      }
      histValues.push(val);
    }

    histValues.sort((a, b) => a - b);

    const median =
      histValues.length > 0
        ? histValues.length % 2 === 0
          ? (histValues[histValues.length / 2 - 1] +
              histValues[histValues.length / 2]) /
            2
          : histValues[Math.floor(histValues.length / 2)]
        : 0;

    const p25Idx = Math.floor(histValues.length * 0.25);
    const p75Idx = Math.floor(histValues.length * 0.75);
    const p25 = histValues.length > 0 ? histValues[p25Idx] : 0;
    const p75 = histValues.length > 0 ? histValues[p75Idx] : 0;

    data.push({
      dayOfYear: day,
      dateLabel: getMonthDayLabel(day),
      current: currentVal,
      median,
      p25,
      p75,
    });
  }

  // Compute the band as a single range value for Area
  const chartData = data.map((d) => ({
    ...d,
    band: [d.p25, d.p75] as [number, number],
  }));

  // Month start days for leap year (2024, matching getMonthDayLabel reference)
  const monthTicks = [1, 32, 61, 92, 122, 153, 183, 214, 245].filter(
    (d) => d <= maxDay
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        Cumulative Earthquakes Over the Year
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        {currentYear} vs. historical median and 25th-75th percentile range
      </p>
      <div className="w-full" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="dayOfYear"
              ticks={monthTicks}
              tickFormatter={(day) => getMonthDayLabel(day)}
              tick={{ fontSize: 11, fill: "#6b7280" }}
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
              labelFormatter={(day) => getMonthDayLabel(day as number)}
              formatter={(value, name) => {
                if (name === "band") return [null, null];
                return [value, name === "current" ? String(currentYear) : name];
              }}
            />
            <Area
              dataKey="band"
              fill="#e2e8f0"
              stroke="none"
              fillOpacity={0.5}
              name="25th-75th pct"
              type="stepAfter"
            />
            <Line
              type="stepAfter"
              dataKey="median"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
              name="Median"
            />
            <Line
              type="stepAfter"
              dataKey="current"
              stroke="#1d4ed8"
              strokeWidth={2.5}
              dot={false}
              name={`${currentYear}`}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
