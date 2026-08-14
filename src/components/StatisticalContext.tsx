"use client";

import { MagnitudeThreshold, YearCounts } from "@/types/earthquake";
import {
  calculateStats,
  thresholdLabel,
} from "@/lib/earthquakeStats";

export default function StatisticalContext({
  years,
  currentYear,
  threshold,
  cutoffDisplay,
}: {
  years: YearCounts[];
  currentYear: number;
  threshold: MagnitudeThreshold;
  cutoffDisplay: string;
}) {
  const stats = calculateStats(years, currentYear, threshold);
  const historicalCount = years.length - 1;
  const label = thresholdLabel(threshold);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-3">
        Statistical Context
      </h3>
      <p className="text-sm text-gray-700 leading-relaxed mb-4">
        {currentYear} has recorded{" "}
        <span className="font-semibold">{stats.current}</span>{" "}
        {label} earthquakes through {cutoffDisplay}. The{" "}
        {years[0]?.year}&ndash;{currentYear - 1} average for the same
        period is{" "}
        <span className="font-semibold">{stats.mean}</span>.
      </p>

      {historicalCount > 0 && (
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          {currentYear} has had more {label} earthquakes by this date than{" "}
          <span className="font-semibold">{stats.percentile}%</span> of the
          previous {historicalCount} years.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div className="bg-gray-50 rounded-md p-3">
          <div className="text-gray-500 text-xs mb-1">Mean</div>
          <div className="font-semibold text-gray-900">{stats.mean}</div>
        </div>
        <div className="bg-gray-50 rounded-md p-3">
          <div className="text-gray-500 text-xs mb-1">Median</div>
          <div className="font-semibold text-gray-900">{stats.median}</div>
        </div>
        <div className="bg-gray-50 rounded-md p-3">
          <div className="text-gray-500 text-xs mb-1">Min</div>
          <div className="font-semibold text-gray-900">{stats.min}</div>
        </div>
        <div className="bg-gray-50 rounded-md p-3">
          <div className="text-gray-500 text-xs mb-1">Max</div>
          <div className="font-semibold text-gray-900">{stats.max}</div>
        </div>
      </div>
    </div>
  );
}
