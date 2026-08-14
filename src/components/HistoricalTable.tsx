"use client";

import { YearCounts } from "@/types/earthquake";

export default function HistoricalTable({
  years,
  currentYear,
}: {
  years: YearCounts[];
  currentYear: number;
}) {
  const sorted = [...years].sort((a, b) => b.year - a.year);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-5 pb-3">
        <h3 className="text-base font-semibold text-gray-900">
          Historical Comparison
        </h3>
        <p className="text-sm text-gray-500 mt-0.5">
          Year-to-date earthquake counts by magnitude threshold
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-gray-200 bg-gray-50">
              <th className="px-5 py-2.5 text-left font-medium text-gray-500">
                Year
              </th>
              <th className="px-5 py-2.5 text-right font-medium text-gray-500">
                M6.0+
              </th>
              <th className="px-5 py-2.5 text-right font-medium text-gray-500">
                M7.0+
              </th>
              <th className="px-5 py-2.5 text-right font-medium text-gray-500">
                M7.5+
              </th>
              <th className="px-5 py-2.5 text-right font-medium text-gray-500">
                M8.0+
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((y) => (
              <tr
                key={y.year}
                className={`border-t border-gray-100 ${
                  y.year === currentYear
                    ? "bg-blue-50 font-semibold"
                    : "hover:bg-gray-50"
                }`}
              >
                <td className="px-5 py-2.5 text-gray-900">{y.year}</td>
                <td className="px-5 py-2.5 text-right text-gray-700 tabular-nums">
                  {y.m6}
                </td>
                <td className="px-5 py-2.5 text-right text-gray-700 tabular-nums">
                  {y.m7}
                </td>
                <td className="px-5 py-2.5 text-right text-gray-700 tabular-nums">
                  {y.m75}
                </td>
                <td className="px-5 py-2.5 text-right text-gray-700 tabular-nums">
                  {y.m8}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
