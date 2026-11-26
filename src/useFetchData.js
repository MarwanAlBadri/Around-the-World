import { useEffect, useState } from "react";

const FIELDS =
  "name,flags,population,capital,region,subregion,tld,currencies,languages";

// In production the app calls its own Vercel function (/api/countries), which
// fetches REST Countries on the server. In development (no /api server) it
// calls REST Countries directly.
function buildUrl(country) {
  if (import.meta.env.DEV) {
    return country
      ? `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fields=${FIELDS}`
      : `https://restcountries.com/v3.1/all?fields=${FIELDS}`;
  }
  return country
    ? `/api/countries?name=${encodeURIComponent(country)}`
    : "/api/countries";
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

    fetch(buildUrl(country))
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (ignore) return;
        if (country) {
          // the direct API returns an array, our function returns one object
          setResult(Array.isArray(data) ? data[0] : data);
        } else {
          setResult(data);
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
