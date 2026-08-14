import { MagnitudeThreshold, Stats, YearCounts } from "@/types/earthquake";

export function getCountForThreshold(
  year: YearCounts,
  threshold: MagnitudeThreshold
): number {
  switch (threshold) {
    case 6:
      return year.m6;
    case 7:
      return year.m7;
    case 7.5:
      return year.m75;
    case 8:
      return year.m8;
  }
}

export function calculateStats(
  years: YearCounts[],
  currentYear: number,
  threshold: MagnitudeThreshold
): Stats {
  const currentYearData = years.find((y) => y.year === currentYear);
  const historicalYears = years.filter((y) => y.year !== currentYear);

  const current = currentYearData
    ? getCountForThreshold(currentYearData, threshold)
    : 0;
  const historicalCounts = historicalYears.map((y) =>
    getCountForThreshold(y, threshold)
  );

  const allCounts = years.map((y) => getCountForThreshold(y, threshold));

  const mean =
    historicalCounts.length > 0
      ? historicalCounts.reduce((a, b) => a + b, 0) / historicalCounts.length
      : 0;

  const sorted = [...historicalCounts].sort((a, b) => a - b);
  const median =
    sorted.length > 0
      ? sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)]
      : 0;

  const min = sorted.length > 0 ? sorted[0] : 0;
  const max = sorted.length > 0 ? sorted[sorted.length - 1] : 0;

  // Rank: 1 = most active. Among all displayed years.
  const allSorted = [...allCounts].sort((a, b) => b - a);
  const rank = allSorted.indexOf(current) + 1;

  /**
   * Percentile: proportion of historical years with fewer earthquakes
   * than the current year. Uses strict less-than comparison.
   * A percentile of 73 means "more than 73% of previous years."
   * Ties are handled by counting only strictly-less values.
   */
  const fewerCount = historicalCounts.filter((c) => c < current).length;
  const percentile =
    historicalCounts.length > 0
      ? Math.round((fewerCount / historicalCounts.length) * 100)
      : 0;

  const percentDiffFromMean =
    mean > 0 ? Math.round(((current - mean) / mean) * 100) : 0;

  return {
    current,
    mean: Math.round(mean * 10) / 10,
    median,
    min,
    max,
    rank,
    totalYears: years.length,
    percentile,
    percentDiffFromMean,
  };
}

export function thresholdLabel(threshold: MagnitudeThreshold): string {
  if (threshold === 7.5) return "M7.5+";
  return `M${threshold}.0+`;
}
