
export interface HomeData {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;

  transactionCount?: number;

  topCategory: string | null;

  topMerchant: {
    name: string;
    amount: number;
  } | null;

  categoryBreakdown: {
    category: string;
    amount: number;
  }[];

  recentTransactions: any[];
}