"use client";

import { Earthquake } from "@/types/earthquake";

export default function CurrentYearEvents({
  events,
  currentYear,
}: {
  events: Earthquake[];
  currentYear: number;
}) {
  // Filter M7+ and sort by magnitude desc, then time desc
  const filtered = events
    .filter((e) => e.magnitude >= 7.0)
    .sort((a, b) => b.magnitude - a.magnitude || b.time - a.time);

  if (filtered.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-base font-semibold text-gray-900">
          Largest Earthquakes of {currentYear}
        </h3>
        <p className="text-sm text-gray-500 mt-2">
          No M7.0+ earthquakes recorded in the current year-to-date period.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-5 pb-3">
        <h3 className="text-base font-semibold text-gray-900">
          Largest Earthquakes of {currentYear}
        </h3>
        <p className="text-sm text-gray-500 mt-0.5">
          All M7.0+ earthquakes in the year-to-date period
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-gray-200 bg-gray-50">
              <th className="px-5 py-2.5 text-left font-medium text-gray-500">
                Date
              </th>
              <th className="px-5 py-2.5 text-right font-medium text-gray-500">
                Magnitude
              </th>
              <th className="px-5 py-2.5 text-left font-medium text-gray-500">
                Location
              </th>
              <th className="px-5 py-2.5 text-right font-medium text-gray-500">
                Depth (km)
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr
                key={e.id}
                className="border-t border-gray-100 hover:bg-gray-50"
              >
                <td className="px-5 py-2.5 text-gray-700 whitespace-nowrap">
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:text-blue-900 underline decoration-blue-300"
                  >
                    {new Date(e.time).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                  </a>
                </td>
                <td className="px-5 py-2.5 text-right font-semibold text-gray-900 tabular-nums">
                  {e.magnitude.toFixed(1)}
                </td>
                <td className="px-5 py-2.5 text-gray-700">{e.place}</td>
                <td className="px-5 py-2.5 text-right text-gray-700 tabular-nums">
                  {e.depth.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
