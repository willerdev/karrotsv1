import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WalletContextType {
  walletBalance: number;
  updateWalletBalance: (newBalance: number) => void;
  walletId: string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletId] = useState(() => Math.random().toString(36).substr(2, 9));

  const updateWalletBalance = (newBalance: number) => {
    setWalletBalance(newBalance);
  };

  return (
    <WalletContext.Provider value={{ walletBalance, updateWalletBalance, walletId }}>
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
