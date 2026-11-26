import { useEffect, useState } from "react";

// The app calls its own API route (/api/countries), which holds the API key.
// On Vercel it runs as a Serverless Function; during `npm run dev`
// the same function is served by a small plugin in vite.config.js.
export default function useFetchData(country) {
  const [result, setResult] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  useEffect(() => {
    let ignore = false;
    const url = country
      ? `/api/countries?name=${encodeURIComponent(country)}`
      : "/api/countries";
    setIsLoading(true);
    setIsError(false);
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (ignore) return;
        setResult(data);
        if (!country) {
          setFilteredCountries(data);
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
