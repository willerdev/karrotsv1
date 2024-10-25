import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WalletContextType {
  walletBalance: number;
  updateWalletBalance: (newBalance: number) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [walletBalance, setWalletBalance] = useState(0);

  const updateWalletBalance = (newBalance: number) => {
    setWalletBalance(newBalance);
  };

  return (
    <WalletContext.Provider value={{ walletBalance, updateWalletBalance }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
