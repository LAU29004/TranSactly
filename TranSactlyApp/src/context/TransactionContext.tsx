import React, { createContext, useContext, useState } from "react";
import { Transaction } from "../types/Transaction";
import { mockTransactions } from "../data/mockData";

type ContextType = {
  transactions: Transaction[];
  setTransactions: (data: Transaction[]) => void;
};

const TransactionContext = createContext<ContextType | null>(null);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);

  return (
    <TransactionContext.Provider value={{ transactions, setTransactions }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) throw new Error("useTransactions must be used inside provider");
  return context;
};