import { ComparisonPeriod } from './insights';
import { Transaction } from '../types/Transaction';

export interface DashboardStats {
  spending: number;
  income: number;
  savings: number;
  savingsRate: number;
  transactionCount: number;
}

export interface SpendingCategory {
  name: string;
  amount: number;
  percent: number;
  color: string;
  icon: string;
}

export interface EarningData {
  month: string;
  earnings: number;
  spending: number;
}

const CATEGORY_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA502',
  '#9C27B0',
  '#95E1D3',
];

export const filterTransactionsByPeriod = (
  transactions: Transaction[],
  period: ComparisonPeriod,
): Transaction[] => {
  const now = new Date();
  const startDate = new Date();

  switch (period) {
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'sixMonths':
      startDate.setMonth(now.getMonth() - 6);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  return transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate >= startDate;
  });
};

export const calculateDashboardStats = (
  transactions: Transaction[],
): DashboardStats => {

  let spending = 0;

  let income = 0;

  transactions.forEach(tx => {

    if (tx.type === 'debit') {

      spending += tx.amount;

    } else {

      income += tx.amount;
    }
  });

  const savings =
    income - spending;

  const savingsRate =
    income > 0
      ? Math.round(
          (savings / income) * 100,
        )
      : 0;

  return {

    spending,

    income,

    savings,

    savingsRate,

    transactionCount:
      transactions.length,
  };
};


export const generateSpendingCategories = (
  transactions: Transaction[],
): SpendingCategory[] => {

  const debitTransactions =
    transactions.filter(
      t => t.type === 'debit',
    );

  const grouped:
    Record<string, number> = {};

  debitTransactions.forEach(tx => {

    grouped[tx.category] =

      (grouped[tx.category] || 0)

      + tx.amount;
  });

  const total =
    Object.values(grouped)
      .reduce(
        (sum, val) => sum + val,
        0,
      );

  return Object.entries(grouped)

    .sort((a, b) => b[1] - a[1])

    .map(
      ([category, amount], index) => ({

        name: category,

        amount,

        percent:

          total

            ? Math.round(
                (amount / total) * 100,
              )

            : 0,

        color:
          CATEGORY_COLORS[
            index %
            CATEGORY_COLORS.length
          ],

        icon: 'chart-pie',
      }),
    );
};


export const generateEarningData = (
  transactions: Transaction[],
): EarningData[] => {

  const monthlyMap:
    Record<
      string,
      {
        earnings: number;
        spending: number;
      }
    > = {};

  transactions.forEach(tx => {

    const date =
      new Date(tx.date);

    const month =
      date.toLocaleString(
        'default',
        { month: 'short' },
      );

    if (!monthlyMap[month]) {

      monthlyMap[month] = {

        earnings: 0,

        spending: 0,
      };
    }

    if (tx.type === 'credit') {

      monthlyMap[month]
        .earnings += tx.amount;

    } else {

      monthlyMap[month]
        .spending += tx.amount;
    }
  });

  return Object.entries(
    monthlyMap,
  ).map(([month, data]) => ({

    month,

    earnings:
      data.earnings,

    spending:
      data.spending,
  }));
};
