import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CurrencyConverter = () => {
  const [rates, setRates] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await axios.get(
          `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=_G11FAZnSg0do1dUSHleOgFcFco1piHi&symbols=PKR,GBP,EUR,USD`
        );
        setRates(response.data.rates);
      } catch (err) {
        setError('Failed to fetch currency rates');
        console.error(err);
      }
    };

    fetchRates();
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!rates) return <div>Loading...</div>;

  return (
    <div>
      <h2>Currency Conversion Rates (Base: USD)</h2>
      <ul>
        {Object.entries(rates).map(([currency, rate]) => (
          <li key={currency}>
            {currency}: {parseFloat(rate).toFixed(4)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CurrencyConverter;