export interface Transaction {
  id: string;
  text: string;
  amount: number;
  merchant: string;
  category: string;
  type: 'debit' | 'credit';
  date: string;
}

export interface FilterState {
  range: '7D' | '15D' | '1M' | '1Y' | 'CUSTOM';
  startDate: Date;
  endDate: Date;
  onlyTransactionMessages: boolean;
}