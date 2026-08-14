import { calculateStats, getCountForThreshold } from "../earthquakeStats";
import { YearCounts, MagnitudeThreshold } from "@/types/earthquake";

function makeYear(
  year: number,
  m6: number,
  m7: number,
  m75: number,
  m8: number
): YearCounts {
  return { year, m6, m7, m75, m8 };
}

describe("getCountForThreshold", () => {
  const year = makeYear(2026, 100, 12, 4, 1);

  it("returns correct count for each threshold", () => {
    expect(getCountForThreshold(year, 6)).toBe(100);
    expect(getCountForThreshold(year, 7)).toBe(12);
    expect(getCountForThreshold(year, 7.5)).toBe(4);
    expect(getCountForThreshold(year, 8)).toBe(1);
  });
});

describe("calculateStats", () => {
  const years: YearCounts[] = [
    makeYear(2020, 80, 8, 2, 0),
    makeYear(2021, 90, 10, 3, 1),
    makeYear(2022, 70, 6, 1, 0),
    makeYear(2023, 85, 9, 2, 0),
    makeYear(2024, 95, 11, 4, 1),
    makeYear(2025, 75, 7, 2, 0),
    makeYear(2026, 88, 12, 5, 2),
  ];

  it("calculates mean from historical years only (excludes current)", () => {
    const stats = calculateStats(years, 2026, 7);
    // Historical M7: [8, 10, 6, 9, 11, 7] = 51/6 = 8.5
    expect(stats.mean).toBe(8.5);
    expect(stats.current).toBe(12);
  });

  it("calculates median correctly for even number of historical years", () => {
    const stats = calculateStats(years, 2026, 7);
    // Sorted historical M7: [6, 7, 8, 9, 10, 11]
    // Median of 6 values: (8 + 9) / 2 = 8.5
    expect(stats.median).toBe(8.5);
  });

  it("calculates min and max from historical years", () => {
    const stats = calculateStats(years, 2026, 7);
    expect(stats.min).toBe(6);
    expect(stats.max).toBe(11);
  });

  it("calculates rank among all displayed years", () => {
    const stats = calculateStats(years, 2026, 7);
    // All M7: [8, 10, 6, 9, 11, 7, 12] sorted desc: [12, 11, 10, 9, 8, 7, 6]
    // 12 is rank 1
    expect(stats.rank).toBe(1);
    expect(stats.totalYears).toBe(7);
  });

  it("calculates rank for middle position", () => {
    const stats = calculateStats(years, 2026, 6);
    // All M6: [80, 90, 70, 85, 95, 75, 88] sorted desc: [95, 90, 88, 85, 80, 75, 70]
    // 88 is at index 2, so rank 3
    expect(stats.rank).toBe(3);
  });

  it("calculates percentile using strict less-than", () => {
    const stats = calculateStats(years, 2026, 7);
    // Historical M7: [8, 10, 6, 9, 11, 7]
    // Current = 12, all 6 historical values are < 12
    // Percentile = 6/6 * 100 = 100
    expect(stats.percentile).toBe(100);
  });

  it("handles percentile with ties correctly", () => {
    const yearsWithTie: YearCounts[] = [
      makeYear(2024, 80, 10, 2, 0),
      makeYear(2025, 90, 10, 3, 0),
      makeYear(2026, 85, 10, 2, 0),
    ];
    const stats = calculateStats(yearsWithTie, 2026, 7);
    // Historical M7: [10, 10], current = 10
    // Fewer: 0 values are < 10
    // Percentile = 0/2 * 100 = 0
    expect(stats.percentile).toBe(0);
  });

  it("calculates percent difference from mean", () => {
    const stats = calculateStats(years, 2026, 7);
    // Current = 12, mean = 8.5
    // (12 - 8.5) / 8.5 * 100 = 41.18... ≈ 41
    expect(stats.percentDiffFromMean).toBe(41);
  });

  it("handles single year (no historical data)", () => {
    const singleYear = [makeYear(2026, 80, 10, 3, 1)];
    const stats = calculateStats(singleYear, 2026, 7);
    expect(stats.current).toBe(10);
    expect(stats.mean).toBe(0);
    expect(stats.median).toBe(0);
    expect(stats.min).toBe(0);
    expect(stats.max).toBe(0);
    expect(stats.rank).toBe(1);
    expect(stats.percentile).toBe(0);
  });

  it("M8+ events are counted in M7+ and M6+ thresholds", () => {
    // This tests the cumulative threshold principle
    const year = makeYear(2026, 88, 12, 5, 2);
    expect(getCountForThreshold(year, 6)).toBeGreaterThanOrEqual(
      getCountForThreshold(year, 7)
    );
    expect(getCountForThreshold(year, 7)).toBeGreaterThanOrEqual(
      getCountForThreshold(year, 7.5)
    );
    expect(getCountForThreshold(year, 7.5)).toBeGreaterThanOrEqual(
      getCountForThreshold(year, 8)
    );
  });
});
