import React, { createContext, useContext, useState } from 'react';
import { Transaction } from '../types/Transaction';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { secureSet , secureGet } from '../services/secureStorage';
const TRANSACTION_CACHE_KEY = 'TRANSACTION_CACHE';
type ContextType = {
  transactions: Transaction[];
  setTransactions: (data: Transaction[]) => void;
};

const TransactionContext = createContext<ContextType | null>(null);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const loadCachedTransactions = async () => {
      try {
        const cached =await secureGet(TRANSACTION_CACHE_KEY,);

        if (cached) {
          setTransactions(JSON.parse(cached));
        }
      } catch (e) {
      }
    };

    loadCachedTransactions();
  }, []);

  useEffect(() => {
    const saveTransactions = async () => {
      try {
        await secureSet(TRANSACTION_CACHE_KEY, transactions);
      } catch (e) {
      }
    };

    saveTransactions();
  }, [transactions]);

  return (
    <TransactionContext.Provider value={{ transactions, setTransactions }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) throw new Error('useTransactions must be used inside provider');
  return context;
};
