import React, { useState, useEffect } from 'react';
import axios from 'axios';
import currencyData from '../data/currency';

interface CurrencyInfo {
  country: string;
  currency_code: string | null;
}

const CurrencyLocator: React.FC = () => {
  const [country, setCountry] = useState<string | null>(null);
  const [currencyCode, setCurrencyCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get('https://ipapi.co/json/');
        const countryName = response.data.country_name;
        setCountry(countryName);

        const currencyInfo = currencyData.find(
          (item: CurrencyInfo) => item.country.toLowerCase() === countryName.toLowerCase()
        );

        if (currencyInfo && currencyInfo.currency_code) {
          setCurrencyCode(currencyInfo.currency_code);
        } else {
          setError(`Currency code not found for ${countryName}`);
        }
      } catch (error) {
        setError('Failed to fetch location data');
        console.error('Error fetching location:', error);
      }
    };

    fetchLocation();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!country || !currencyCode) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>Country: {country}</p>
      <p>Currency Code: {currencyCode}</p>
    </div>
  );
};

export default CurrencyLocator;
