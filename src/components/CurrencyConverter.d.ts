import React from 'react';

interface CurrencyConverterProps {
  amount: number;
  fromCurrency: string;
  // Remove toCurrency from props as it will be determined internally
}

declare const CurrencyConverter: React.FC<CurrencyConverterProps>;

export default CurrencyConverter;
