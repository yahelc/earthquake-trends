import { Earthquake, YearCounts } from "@/types/earthquake";
import { DateWindow } from "./dateWindows";

const USGS_BASE = "https://earthquake.usgs.gov/fdsnws/event/1";

/**
 * Fetch M6+ events for a given date window from USGS.
 * We fetch all M6+ events once per window and derive higher thresholds locally.
 */
async function fetchEventsForWindow(
  window: DateWindow
): Promise<Earthquake[]> {
  const url = `${USGS_BASE}/query?format=geojson&starttime=${window.starttime}&endtime=${window.endtime}&minmagnitude=6&orderby=magnitude&limit=20000`;

  const res = await fetch(url, { next: { revalidate: false } });
  if (!res.ok) {
    throw new Error(
      `USGS API error: ${res.status} ${res.statusText} for ${window.year}`
    );
  }

  const data = await res.json();
  return (data.features || []).map((f: any) => ({
    id: f.id,
    magnitude: f.properties.mag,
    place: f.properties.place || "Unknown location",
    time: f.properties.time,
    depth: f.geometry.coordinates[2],
    url: f.properties.url,
    latitude: f.geometry.coordinates[1],
    longitude: f.geometry.coordinates[0],
  }));
}

function countByThreshold(events: Earthquake[]): Omit<YearCounts, "year"> {
  let m6 = 0,
    m7 = 0,
    m75 = 0,
    m8 = 0;
  for (const e of events) {
    if (e.magnitude >= 6.0) m6++;
    if (e.magnitude >= 7.0) m7++;
    if (e.magnitude >= 7.5) m75++;
    if (e.magnitude >= 8.0) m8++;
  }
  return { m6, m7, m75, m8 };
}

// In-memory cache
interface CacheEntry {
  data: { events: Earthquake[]; counts: Omit<YearCounts, "year"> };
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function getCacheTTL(year: number, currentYear: number): number {
  if (year === currentYear) {
    return 15 * 60 * 1000; // 15 minutes for current year
  }
  return 30 * 24 * 60 * 60 * 1000; // 30 days for historical
}

export async function fetchYearData(
  window: DateWindow,
  currentYear: number
): Promise<{ counts: YearCounts; events: Earthquake[] }> {
  const cacheKey = `${window.year}:${window.starttime}:${window.endtime}`;
  const cached = cache.get(cacheKey);
  const ttl = getCacheTTL(window.year, currentYear);

  if (cached && Date.now() - cached.timestamp < ttl) {
    return {
      counts: { year: window.year, ...cached.data.counts },
      events: cached.data.events,
    };
  }

  const events = await fetchEventsForWindow(window);
  const counts = countByThreshold(events);

  cache.set(cacheKey, {
    data: { events, counts },
    timestamp: Date.now(),
  });

  return {
    counts: { year: window.year, ...counts },
    events,
  };
}

export async function fetchAllYears(
  windows: DateWindow[],
  currentYear: number
): Promise<{
  years: YearCounts[];
  currentYearEvents: Earthquake[];
  allYearEvents: Record<number, Earthquake[]>;
}> {
  const years: YearCounts[] = [];
  let currentYearEvents: Earthquake[] = [];
  const allYearEvents: Record<number, Earthquake[]> = {};

  // Batch in groups of 3 with small delays
  for (let i = 0; i < windows.length; i += 3) {
    const batch = windows.slice(i, i + 3);
    const results = await Promise.all(
      batch.map((w) => fetchYearData(w, currentYear))
    );

    for (const result of results) {
      years.push(result.counts);
      allYearEvents[result.counts.year] = result.events;
      if (result.counts.year === currentYear) {
        currentYearEvents = result.events;
      }
    }

    if (i + 3 < windows.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  years.sort((a, b) => a.year - b.year);
  return { years, currentYearEvents, allYearEvents };
}
