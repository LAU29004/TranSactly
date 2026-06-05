export interface Transaction { 
  id: string; 
  text: string; 
  amount: number; 
  merchant: string; 
  category: string; 
  intent: string;
  type: 'credit' | 'debit'; 
  date: string; 
}

export interface FilterState {
range:
  | 'THIS_MONTH'
  | 'SIX_MONTHS'
  | 'THIS_YEAR'
  | 'CUSTOM';

  startDate: Date;
  endDate: Date;
  onlyTransactionMessages: boolean;
}