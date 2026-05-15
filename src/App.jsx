import { useEffect, useState } from "react";
import "./App.css";
import CountryList from "./components/CountryList";
import Header from "./components/Header";
import RegionMenu from "./components/RegionMenu";
import SearchInput from "./components/SearchInput";
import ShowMessage from "./components/ShowMessage";

function App() {
  const [countriesList, setCountriesList] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const fetchCountriesData = () => {
    setIsLoading(true);
    fetch(
      "https://restcountries.com/v3.1/all?fields=name,flags,population,capital,region",
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setCountriesList(data);
        setFilteredCountries(data);
      })
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  };
  useEffect(() => {
    fetchCountriesData();
  }, []);
  return (
    <div className="font-inter min-h-screen w-screen bg-gray-100 dark:bg-gray-900 dark:text-gray-100">
      <Header />
      <div className="container mx-auto px-5 md:px-0">
        {isError && <ShowMessage message="Something went wrong !" />}
        {isLoading && <ShowMessage message="Loading countries data ...!" />}
        {!isLoading && !isError && (
          <>
            <div className="flex flex-col justify-between gap-10 md:h-14 md:flex-row md:gap-0">
              <SearchInput />
              <RegionMenu
                countriesList={countriesList}
                filterCountriesList={setFilteredCountries}
              />
            </div>
            <CountryList data={filteredCountries} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
