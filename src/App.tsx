import './App.css';
import axios from "axios";
import { useEffect, useState } from 'react';


export type Country =  {
  name: string;
  region: string;
  area: number;
}

const countriesCountPerPage = 10;

function App() {
  const [currentySelectedPageIndex, setCurrentlySelectedPageIndex] = useState(0);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: countriesResponseData}= await axios.get<Country[]>("https://restcountries.com/v2/all?fields=name,region,area");
        setCountries(countriesResponseData);
      } catch {
        setErrored(true);
      } finally {
        setLoaded(true);
      }
    })()
  }, [currentySelectedPageIndex])
  
  if (!loaded) {
    return <div>Loding...</div>
  }

  if (errored) {
    return <div>Sorry, an error occured. Please try refreshing the page.</div>
  }

  if (countries.length > 0) {
    
    return (<div>
        {countries.map(country => (<div>{country.name}</div>))}
    </div>)
  }

  return <div>Sorry, something unexcepted occured. Please try refreshing the page.</div>
}

export default App;
