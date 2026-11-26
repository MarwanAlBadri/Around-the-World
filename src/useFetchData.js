import { useEffect, useState } from "react";

// Country data is bundled with the app (src/data/countries.json) and the
// flags are served from /public/flags, so the app needs no API key and
// keeps working even if a third-party API changes or shuts down.
// The JSON is loaded lazily, so it doesn't slow down the first page load.
const loadCountries = () =>
  import("./data/countries.json").then((module) => module.default);

function findCountry(countries, name) {
  const wanted = decodeURIComponent(name).toLowerCase();
  return (
    countries.find((c) => c.name.common.toLowerCase() === wanted) ||
    countries.find((c) => c.name.official.toLowerCase() === wanted)
  );
}

export default function useFetchData(country) {
  const [result, setResult] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    setIsError(false);

    loadCountries()
      .then((countries) => {
        if (ignore) return;
        if (country) {
          const match = findCountry(countries, country);
          if (!match) throw new Error("Country not found");
          setResult(match);
        } else {
          setResult(countries);
          setFilteredCountries(countries);
        }
      })
      .catch(() => !ignore && setIsError(true))
      .finally(() => !ignore && setIsLoading(false));

    return () => {
      ignore = true;
    };
  }, [country]);

  return {
    result,
    isLoading,
    isError,
    filteredCountries,
    setFilteredCountries,
  };
}
