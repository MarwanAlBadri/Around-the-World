import ShowMessage from "../components/ShowMessage";
import SearchInput from "../components/SearchInput";
import RegionMenu from "../components/RegionMenu";
import CountryList from "../components/CountryList";
import useFetchData from "../useFetchData";

export default function HomePage() {
    const{isError,isLoading ,result ,setFilteredCountries , filteredCountries}  =useFetchData()
  
  
  return (
    <>
      {isError && <ShowMessage message="Something went wrong !" />}
      {isLoading && <ShowMessage message="Loading countries data ...!" />}
      {!isLoading && !isError && (
        <>
          <div className="flex flex-col justify-between gap-10 md:h-14 md:flex-row md:gap-0">
            <SearchInput
              countriesList={result}
              filterCountriesList={setFilteredCountries}
            />
            <RegionMenu
              countriesList={result}
              filterCountriesList={setFilteredCountries}
            />
          </div>
          <CountryList data={filteredCountries} />
        </>
      )}
    </>
  );
}
