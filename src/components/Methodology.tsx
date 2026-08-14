export default function Methodology() {
  return (
    <div className="border-t border-gray-200 pt-6 mt-8">
      <p className="text-xs text-gray-500 mb-2">
        Source:{" "}
        <a
          href="https://earthquake.usgs.gov/earthquakes/search/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700"
        >
          U.S. Geological Survey (USGS)
        </a>
        , ANSS Comprehensive Earthquake Catalog (ComCat).{" "}
        <a
          href="https://earthquake.usgs.gov/fdsnws/event/1/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700"
        >
          API Documentation
        </a>
        .
      </p>
      <details className="text-xs text-gray-500">
        <summary className="cursor-pointer hover:text-gray-700">
          Methodology
        </summary>
        <p className="mt-2 leading-relaxed max-w-prose">
          Counts include worldwide earthquakes at or above the selected USGS
          preferred magnitude. Each historical year is measured from January 1
          through the same calendar cutoff as the current year (the last
          fully completed UTC day). Magnitudes can be revised by USGS, so
          historical counts may change. The historical average is calculated
          from prior years only and does not include the current year.
          Percentiles use strict less-than comparison: the percentage of
          historical years with fewer earthquakes than the current year.
        </p>
      </details>
    </div>
  );
}
