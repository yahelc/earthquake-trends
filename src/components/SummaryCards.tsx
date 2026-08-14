"use client";

import { Stats, MagnitudeThreshold, YearCounts } from "@/types/earthquake";
import { calculateStats, thresholdLabel } from "@/lib/earthquakeStats";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function StatCard({
  threshold,
  stats,
}: {
  threshold: MagnitudeThreshold;
  stats: Stats;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white">
      <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
        {thresholdLabel(threshold)}
      </div>
      <div className="text-4xl font-bold text-gray-900 mb-1">
        {stats.current}
      </div>
      <div className="text-sm text-gray-500 mb-3">earthquakes this year</div>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Historical avg</span>
          <span className="font-medium text-gray-700">{stats.mean}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Rank</span>
          <span className="font-medium text-gray-700">
            {ordinal(stats.rank)} of {stats.totalYears} years
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SummaryCards({
  years,
  currentYear,
}: {
  years: YearCounts[];
  currentYear: number;
}) {
  const thresholds: MagnitudeThreshold[] = [6, 7, 7.5];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {thresholds.map((t) => (
        <StatCard
          key={t}
          threshold={t}
          stats={calculateStats(years, currentYear, t)}
        />
      ))}
    </div>
  );
}
