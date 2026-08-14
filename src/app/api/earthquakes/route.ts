import { NextRequest, NextResponse } from "next/server";
import {
  getCutoffDate,
  buildDateWindows,
  formatDateISO,
  getStartYear,
} from "@/lib/dateWindows";
import { fetchAllYears } from "@/lib/usgs";
import { EarthquakeData, HistoryRange } from "@/types/earthquake";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const yearsParam = searchParams.get("years") || "15";

  let range: HistoryRange;
  if (yearsParam === "all") {
    range = "all";
  } else {
    const n = parseInt(yearsParam, 10);
    if ([10, 15, 25].includes(n)) {
      range = n as 10 | 15 | 25;
    } else {
      range = 15;
    }
  }

  try {
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const cutoff = getCutoffDate(now);
    const startYear = getStartYear(currentYear, range);
    const windows = buildDateWindows(currentYear, cutoff, startYear);

    const { years, currentYearEvents, allYearEvents } = await fetchAllYears(
      windows,
      currentYear
    );

    const data: EarthquakeData = {
      years,
      currentYearEvents,
      allYearEvents,
      cutoffDate: formatDateISO(cutoff),
      currentYear,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching earthquake data:", error);
    return NextResponse.json(
      {
        error: "USGS earthquake data are temporarily unavailable.",
        message:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 }
    );
  }
}
