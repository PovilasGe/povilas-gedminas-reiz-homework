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
    return <div className='error'><h1>Loading...</h1></div>
  }

  if (errored) {
    return <div className='error'><h1>Sorry, an error occured. Please try refreshing the page.</h1></div>
  }

  if (countries.length > 0) {
    return (
      <div>
        <div className='wrapper'>
          <div className='filter_wrapper'>
            <button className='filter_button button' onClick={toggleSmallerThanLithuaniaFilteredOut}>{smallerThanLithuaniaFilteredOut === false ? "Filter out countries smaller than Lithuania" : 'Remove filtering' }</button>
            <button className='filter_button button' onClick={toggleOceaniaFilteredOut}>{oceaniaFilteredOut === false ? "Filter out countries from Oceania region" : 'Remove filtering' }</button>
          </div>
          <div className='sort_wrapper'>
            <button className='sort_button button' onClick={toggleSortOrder}>Sort by Name {sortOrder === "desc" ? "A->Z" : "Z->A" }</button>
          </div>
        </div>
        <div>
          {filteredCountries
            .slice(startIndex, endIndex)
            .map(country => (
                <div className='country'>
                  <div className='name'><span>Name:</span> {country.name}</div>
                  <div className='name'><span>Area:</span> {country.area}</div>
                  <div className='name'><span>Region</span>: {country.region}</div>
                </div>
              ))}
        </div>
        <div className='page_button_wrapper'>
          <div className='page_buttons'>
            <button className='page_button' onClick={() => setCurrentPageIndex(currentPageIndex - 1)} disabled={currentPageIndex === 1}>Previous</button>
            <button className='page_button' onClick={() => setCurrentPageIndex(currentPageIndex + 1)} disabled={endIndex >= filteredCountries.length}>Next</button>
          </div>
          <div className='page_numbers'>
            {Array.from({length: filteredPagesCount}, (_, i) => i + 1).map(page => (
              <button className='page_number' onClick={() => setCurrentPageIndex(page)} disabled={page === currentPageIndex}>
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <div className='error'><h1>Sorry, something unexpected occurred. Please try refreshing the page.</h1></div>
}

export default App;

