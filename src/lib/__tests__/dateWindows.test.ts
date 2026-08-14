import {
  getCutoffDate,
  buildDateWindows,
  isLeapYear,
  formatDateISO,
  getExclusiveEnd,
  getStartYear,
} from "../dateWindows";

describe("getCutoffDate", () => {
  it("returns yesterday in UTC", () => {
    const now = new Date("2026-08-14T15:30:00Z");
    const cutoff = getCutoffDate(now);
    expect(formatDateISO(cutoff)).toBe("2026-08-13");
  });

  it("handles start of day (midnight UTC)", () => {
    const now = new Date("2026-08-14T00:00:00Z");
    const cutoff = getCutoffDate(now);
    expect(formatDateISO(cutoff)).toBe("2026-08-13");
  });

  it("handles January 1st (cutoff is Dec 31 of previous year)", () => {
    const now = new Date("2026-01-01T12:00:00Z");
    const cutoff = getCutoffDate(now);
    expect(formatDateISO(cutoff)).toBe("2025-12-31");
  });

  it("handles March 1 in a leap year", () => {
    const now = new Date("2024-03-01T12:00:00Z");
    const cutoff = getCutoffDate(now);
    expect(formatDateISO(cutoff)).toBe("2024-02-29");
  });

  it("handles March 1 in a non-leap year", () => {
    const now = new Date("2025-03-01T12:00:00Z");
    const cutoff = getCutoffDate(now);
    expect(formatDateISO(cutoff)).toBe("2025-02-28");
  });
});

describe("getExclusiveEnd", () => {
  it("returns the day after the cutoff", () => {
    const cutoff = new Date("2026-08-13T00:00:00Z");
    const end = getExclusiveEnd(cutoff);
    expect(formatDateISO(end)).toBe("2026-08-14");
  });

  it("handles month boundary", () => {
    const cutoff = new Date("2026-07-31T00:00:00Z");
    const end = getExclusiveEnd(cutoff);
    expect(formatDateISO(end)).toBe("2026-08-01");
  });

  it("handles year boundary", () => {
    const cutoff = new Date("2025-12-31T00:00:00Z");
    const end = getExclusiveEnd(cutoff);
    expect(formatDateISO(end)).toBe("2026-01-01");
  });
});

describe("isLeapYear", () => {
  it("identifies leap years", () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2020)).toBe(true);
    expect(isLeapYear(2000)).toBe(true);
  });

  it("identifies non-leap years", () => {
    expect(isLeapYear(2023)).toBe(false);
    expect(isLeapYear(2025)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
  });
});

describe("buildDateWindows", () => {
  it("creates windows with same month/day cutoff for each year", () => {
    const cutoff = new Date("2026-08-13T00:00:00Z");
    const windows = buildDateWindows(2026, cutoff, 2024);

    expect(windows).toHaveLength(3);

    expect(windows[0]).toEqual({
      year: 2024,
      starttime: "2024-01-01",
      endtime: "2024-08-14", // exclusive end = cutoff + 1
    });
    expect(windows[1]).toEqual({
      year: 2025,
      starttime: "2025-01-01",
      endtime: "2025-08-14",
    });
    expect(windows[2]).toEqual({
      year: 2026,
      starttime: "2026-01-01",
      endtime: "2026-08-14",
    });
  });

  it("handles Feb 29 cutoff in non-leap historical years", () => {
    // If today is March 1, 2024 (leap year) and cutoff is Feb 29
    const cutoff = new Date("2024-02-29T00:00:00Z");
    const windows = buildDateWindows(2024, cutoff, 2022);

    // 2022 is not a leap year, should use Feb 28
    expect(windows[0]).toEqual({
      year: 2022,
      starttime: "2022-01-01",
      endtime: "2022-03-01", // Feb 28 + 1 day exclusive
    });

    // 2023 is not a leap year, should use Feb 28
    expect(windows[1]).toEqual({
      year: 2023,
      starttime: "2023-01-01",
      endtime: "2023-03-01",
    });

    // 2024 is a leap year, should use Feb 29
    expect(windows[2]).toEqual({
      year: 2024,
      starttime: "2024-01-01",
      endtime: "2024-03-01", // Feb 29 + 1 day exclusive
    });
  });

  it("handles cutoff after Feb 29 consistently in all years", () => {
    // Cutoff is Aug 13 - no leap year issues
    const cutoff = new Date("2026-08-13T00:00:00Z");
    const windows = buildDateWindows(2026, cutoff, 2023);

    for (const w of windows) {
      expect(w.starttime).toBe(`${w.year}-01-01`);
      expect(w.endtime).toBe(`${w.year}-08-14`);
    }
  });

  it("applies same cutoff to every year (no off-by-one)", () => {
    const cutoff = new Date("2026-08-13T00:00:00Z");
    const windows = buildDateWindows(2026, cutoff, 2011);

    expect(windows).toHaveLength(16); // 2011..2026

    // Every window should end on the 14th (exclusive of 13th)
    for (const w of windows) {
      expect(w.endtime.endsWith("-08-14")).toBe(true);
    }
  });
});

describe("getStartYear", () => {
  it("returns correct start for numeric ranges", () => {
    expect(getStartYear(2026, 15)).toBe(2011);
    expect(getStartYear(2026, 10)).toBe(2016);
    expect(getStartYear(2026, 25)).toBe(2001);
  });

  it("returns 2000 for 'all'", () => {
    expect(getStartYear(2026, "all")).toBe(2000);
  });
});
