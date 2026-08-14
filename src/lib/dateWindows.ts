/**
 * Date window logic for YTD earthquake comparisons.
 *
 * We use "through yesterday" (complete UTC days) so that
 * partial-day comparisons never arise. The cutoff date is
 * the last fully completed UTC day.
 */

export function getCutoffDate(now: Date = new Date()): Date {
  const utcYear = now.getUTCFullYear();
  const utcMonth = now.getUTCMonth();
  const utcDay = now.getUTCDate();
  // Yesterday in UTC
  const yesterday = new Date(Date.UTC(utcYear, utcMonth, utcDay - 1));
  return yesterday;
}

export function formatCutoffDisplay(cutoff: Date): string {
  return cutoff.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Returns the exclusive end date for USGS queries.
 * USGS endtime is exclusive, so to include all of the cutoff day,
 * we use cutoff + 1 day at 00:00 UTC.
 */
export function getExclusiveEnd(cutoff: Date): Date {
  return new Date(
    Date.UTC(
      cutoff.getUTCFullYear(),
      cutoff.getUTCMonth(),
      cutoff.getUTCDate() + 1
    )
  );
}

export interface DateWindow {
  year: number;
  starttime: string; // YYYY-MM-DD
  endtime: string; // YYYY-MM-DD (exclusive)
}

/**
 * Build date windows for each year using the same month/day cutoff.
 * The cutoff is applied as: Jan 1 through the equivalent calendar day.
 *
 * For leap year handling: if the cutoff is after Feb 29 in a leap year,
 * and a historical year is not a leap year, the cutoff still uses the
 * same month/day. If the cutoff IS Feb 29 and the historical year is
 * not a leap year, we use Feb 28 instead (last day of Feb).
 */
export function buildDateWindows(
  currentYear: number,
  cutoff: Date,
  startYear: number
): DateWindow[] {
  const cutoffMonth = cutoff.getUTCMonth(); // 0-indexed
  const cutoffDay = cutoff.getUTCDate();

  const windows: DateWindow[] = [];

  for (let year = startYear; year <= currentYear; year++) {
    const start = `${year}-01-01`;

    let endDay = cutoffDay;
    let endMonth = cutoffMonth;

    // Handle Feb 29 cutoff in non-leap years
    if (endMonth === 1 && endDay === 29 && !isLeapYear(year)) {
      endDay = 28;
    }

    // Exclusive end = cutoff + 1 day
    const cutoffDate = new Date(Date.UTC(year, endMonth, endDay));
    const exclusiveEnd = new Date(
      Date.UTC(year, endMonth, endDay + 1)
    );

    const endtime = formatDateISO(exclusiveEnd);

    windows.push({ year, starttime: start, endtime });
  }

  return windows;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function formatDateISO(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getStartYear(
  currentYear: number,
  range: number | "all"
): number {
  if (range === "all") {
    return 2000; // ComCat reliable data starts around 2000
  }
  return currentYear - range;
}
