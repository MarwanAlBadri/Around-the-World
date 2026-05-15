import { useEffect, useState } from "react";

export default function useFetchData(country) {
  const [result, setResult] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  useEffect(() => {
    let url =
      "https://restcountries.com/v3.1/all?fields=name,flags,population,capital,region";
    setIsLoading(true);
    if (country) {
      url = `https://restcountries.com/v3.1/name/${country}?fields=name,flags,population,capital,region,subregion,tld,currencies,languages`;
    }
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (country) {
          setResult(data[0]);
        } else {
          setResult(data);
          setFilteredCountries(data);
        }
      })
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, []);

  return {
    result,
    isLoading,
    isError,
    filteredCountries,
    setFilteredCountries,
  };
}
