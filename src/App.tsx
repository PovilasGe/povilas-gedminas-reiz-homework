import './App.css';
import axios from "axios";
import { useCallback, useEffect, useState } from 'react';

export type Country =  {
  name: string;
  region: string;
  area: number;
}

const countriesCountPerPage = 10;

function App() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] =useState<Country[]>([])
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [filteredPagesCount, setFilteredPagesCount] = useState<number>(0);
  useEffect(() => {
    (async () => {
      try {
        const { data: countriesResponseData}= await axios.get<Country[]>("https://restcountries.com/v2/all?fields=name,region,area");
        setCountries(countriesResponseData);
        setFilteredCountries(countriesResponseData);
        setCurrentPageIndex(1);
        setFilteredPagesCount(Math.ceil(countriesResponseData.length / countriesCountPerPage))
      } catch {
        setErrored(true);
      } finally {
        setLoaded(true);
      }
    })()
  }, [])

  const [startIndex, setStartIndex] = useState<number>(0);
  useEffect(() => {
    setStartIndex((currentPageIndex - 1) * countriesCountPerPage);
  }, [currentPageIndex])

  const [endIndex, setEndIndex] = useState<number>(10);
  useEffect(() => {
      setEndIndex(startIndex + countriesCountPerPage);
  }, [startIndex]);
  
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  useEffect(() => {
    if (sortOrder === 'asc') {
      setFilteredCountries([...countries].sort((a, b) => (a.name > b.name ? 1 : -1)));
    } else{
      setFilteredCountries([...countries].sort((a, b) => (a.name < b.name ? 1 : -1)));
    }
  }, [sortOrder, countries]);

  const toggleSortOrder = useCallback(() => {
    if (sortOrder === "asc") {
      setSortOrder("desc");
      return;
    }
    setSortOrder("asc");
    return;
  }, [sortOrder]);

  const [smallerThanLithuaniaFilteredOut, setSmallerThanLithuaniaFilteredOut] = useState(false);
    const toggleSmallerThanLithuaniaFilteredOut = useCallback(() => {
    if (smallerThanLithuaniaFilteredOut) {
      setSmallerThanLithuaniaFilteredOut(false);
    } else {
      setSmallerThanLithuaniaFilteredOut(true);
    }
  }, [smallerThanLithuaniaFilteredOut]);
  
  const [oceaniaFilteredOut, setOceaniaFilteredOut] = useState(false);
  const toggleOceaniaFilteredOut = useCallback(() => {
    if (oceaniaFilteredOut) {
      setOceaniaFilteredOut(false);
    } else {
      setOceaniaFilteredOut(true);
    }
  }, [oceaniaFilteredOut]);
 
  
  useEffect(() => {
    let filteredCountriesResult = [...countries];
    if (smallerThanLithuaniaFilteredOut) {
      filteredCountriesResult = filteredCountriesResult.filter(country => country.area > 65300);
    }
    if (oceaniaFilteredOut) {
      filteredCountriesResult = filteredCountriesResult.filter(country => country.region !== "Oceania")
    }
    setFilteredCountries(filteredCountriesResult);
    setFilteredPagesCount(Math.ceil(filteredCountriesResult.length / countriesCountPerPage))
  }, [smallerThanLithuaniaFilteredOut, oceaniaFilteredOut, countries]);

  useEffect(() => {
    if (currentPageIndex > filteredPagesCount) {
      setCurrentPageIndex(filteredPagesCount);
    }
  }, [currentPageIndex, filteredPagesCount])
  
  if (!loaded) {
    return <div>Loading...</div>
  }

  if (errored) {
    return <div>Sorry, an error occured. Please try refreshing the page.</div>
  }

  if (countries.length > 0) {
    return (
      <div>
        <button onClick={toggleSortOrder}>Sort by Name {sortOrder === "desc" ? "A->Z" : "Z->A" }</button>
        <button onClick={toggleSmallerThanLithuaniaFilteredOut}>Filter out countries smaller than Lithuania</button>
        <button onClick={toggleOceaniaFilteredOut}>Filter out countries that are from Oceania </button>
        <div>
          {filteredCountries
            .slice(startIndex, endIndex)
            .map(country => (
                <div className='country'>
                  <div className='name'>Name: {country.name}</div>
                  <div className='name'>Area: {country.area}</div>
                  <div className='name'>Region: {country.region}</div>
                </div>
              ))}
        </div>
        <div>
          <button onClick={() => setCurrentPageIndex(currentPageIndex - 1)} disabled={currentPageIndex === 1}>Previous</button>
          <button onClick={() => setCurrentPageIndex(currentPageIndex + 1)} disabled={endIndex >= filteredCountries.length}>Next</button>
        </div>
        <div>
          {Array.from({length: filteredPagesCount}, (_, i) => i + 1).map(page => (
            <button onClick={() => setCurrentPageIndex(page)} disabled={page === currentPageIndex}>
              {page}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return <div>Sorry, something unexpected occurred. Please try refreshing the page.</div>
}

export default App;

