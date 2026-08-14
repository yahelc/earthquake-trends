"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  EarthquakeData,
  MagnitudeThreshold,
  HistoryRange,
  Earthquake,
} from "@/types/earthquake";
import SummaryCards from "@/components/SummaryCards";
import EarthquakeChart from "@/components/EarthquakeChart";
import CumulativeChart from "@/components/CumulativeChart";
import HistoricalTable from "@/components/HistoricalTable";
import CurrentYearEvents from "@/components/CurrentYearEvents";
import StatisticalContext from "@/components/StatisticalContext";
import Methodology from "@/components/Methodology";

const MAGNITUDE_OPTIONS: { value: MagnitudeThreshold; label: string }[] = [
  { value: 6, label: "M6.0+" },
  { value: 7, label: "M7.0+" },
  { value: 7.5, label: "M7.5+" },
  { value: 8, label: "M8.0+" },
];

const YEARS_OPTIONS: { value: HistoryRange; label: string }[] = [
  { value: 10, label: "10 years" },
  { value: 15, label: "15 years" },
  { value: 25, label: "25 years" },
  { value: "all", label: "All available" },
];

function parseMagnitude(s: string | null): MagnitudeThreshold {
  if (!s) return 7;
  const n = parseFloat(s);
  if ([6, 7, 7.5, 8].includes(n)) return n as MagnitudeThreshold;
  return 7;
}

function parseYears(s: string | null): HistoryRange {
  if (s === "all") return "all";
  if (!s) return 15;
  const n = parseInt(s, 10);
  if ([10, 15, 25].includes(n)) return n as 10 | 15 | 25;
  return 15;
}

function formatCutoffDisplay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [magnitude, setMagnitude] = useState<MagnitudeThreshold>(
    parseMagnitude(searchParams.get("magnitude"))
  );
  const [years, setYears] = useState<HistoryRange>(
    parseYears(searchParams.get("years"))
  );
  const [data, setData] = useState<EarthquakeData | null>(null);
  const [allYearEvents, setAllYearEvents] = useState<
    Map<number, Earthquake[]>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateURL = useCallback(
    (mag: MagnitudeThreshold, yrs: HistoryRange) => {
      const params = new URLSearchParams();
      params.set("magnitude", String(mag));
      params.set("years", String(yrs));
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const fetchData = useCallback(async (yrs: HistoryRange) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/earthquakes?years=${yrs}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.error || "USGS earthquake data are temporarily unavailable."
        );
      }
      const result: EarthquakeData = await res.json();
      setData(result);

      const eventsMap = new Map<number, Earthquake[]>();
      for (const [year, events] of Object.entries(result.allYearEvents)) {
        eventsMap.set(Number(year), events);
      }
      setAllYearEvents(eventsMap);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "USGS earthquake data are temporarily unavailable."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(years);
  }, [years, fetchData]);

  const handleMagnitudeChange = (mag: MagnitudeThreshold) => {
    setMagnitude(mag);
    updateURL(mag, years);
  };

  const handleYearsChange = (yrs: HistoryRange) => {
    setYears(yrs);
    updateURL(magnitude, yrs);
  };

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md text-center">
          <p className="text-gray-900 font-medium mb-2">
            Unable to load earthquake data
          </p>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => fetchData(years)}
            className="mt-4 px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-6 w-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-3" />
          <p className="text-sm text-gray-500">
            Loading earthquake data from USGS...
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const cutoffDisplay = formatCutoffDisplay(data.cutoffDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Large Earthquakes This Year
          </h1>
          <p className="text-base text-gray-500 mt-1.5">
            {data.currentYear} through {cutoffDisplay}
          </p>
        </div>

        {/* Summary Cards */}
        <SummaryCards years={data.years} currentYear={data.currentYear} />

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Magnitude:</span>
            <div className="flex rounded-md border border-gray-200 bg-white overflow-hidden">
              {MAGNITUDE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleMagnitudeChange(opt.value)}
                  className={`px-3 py-1.5 text-sm transition-colors ${
                    magnitude === opt.value
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">History:</span>
            <div className="flex rounded-md border border-gray-200 bg-white overflow-hidden">
              {YEARS_OPTIONS.map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => handleYearsChange(opt.value)}
                  className={`px-3 py-1.5 text-sm transition-colors ${
                    years === opt.value
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stale data indicator */}
        {error && data && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            USGS data temporarily unavailable. Showing cached data from{" "}
            {new Date(data.lastUpdated).toLocaleString("en-US", {
              timeZone: "UTC",
            })}{" "}
            UTC.
          </div>
        )}

        {/* Main Chart */}
        <div className="mb-6">
          <EarthquakeChart
            years={data.years}
            currentYear={data.currentYear}
            threshold={magnitude}
          />
        </div>

        {/* Statistical Context */}
        <div className="mb-6">
          <StatisticalContext
            years={data.years}
            currentYear={data.currentYear}
            threshold={magnitude}
            cutoffDisplay={cutoffDisplay}
          />
        </div>

        {/* Cumulative Chart */}
        {allYearEvents.size > 0 && (
          <div className="mb-6">
            <CumulativeChart
              currentYearEvents={data.currentYearEvents}
              allYearEvents={allYearEvents}
              currentYear={data.currentYear}
              cutoffDate={data.cutoffDate}
              threshold={magnitude}
            />
          </div>
        )}

        {/* Historical Table */}
        <div className="mb-6">
          <HistoricalTable
            years={data.years}
            currentYear={data.currentYear}
          />
        </div>

        {/* Current Year Events */}
        <div className="mb-6">
          <CurrentYearEvents
            events={data.currentYearEvents}
            currentYear={data.currentYear}
          />
        </div>

        {/* Last Updated */}
        <p className="text-xs text-gray-400 mb-2">
          Last updated:{" "}
          {new Date(data.lastUpdated).toLocaleString("en-US", {
            timeZone: "UTC",
            dateStyle: "medium",
            timeStyle: "short",
          })}{" "}
          UTC
        </p>

        {/* Methodology */}
        <Methodology />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-6 w-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
