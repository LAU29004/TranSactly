
import { Transaction } from '../types/Transaction';

export type ComparisonPeriod =

  | 'month'
  | 'sixMonths'
  | 'year';

export interface InsightObject {

  icon: string;

  text: string;

  change: string;

  changePercent: number;

  category?: string;

  type:
    | 'warn'
    | 'alert'
    | 'info';

  cta: string;
}

export const generateAIInsights = (

  transactions: Transaction[],
): InsightObject[] => {

  const insights:
    InsightObject[] = [];

  // -------------------------
  // TOTAL SPENDING
  // -------------------------

  const spending =
    transactions

      .filter(
        t => t.type === 'debit',
      )

      .reduce(
        (sum, t) =>
          sum + t.amount,
        0,
      );

  // -------------------------
  // TOTAL INCOME
  // -------------------------

  const income =
    transactions

      .filter(
        t => t.type === 'credit',
      )

      .reduce(
        (sum, t) =>
          sum + t.amount,
        0,
      );

  // -------------------------
  // SAVINGS RATE
  // -------------------------

  const savingsRate =
    income > 0

      ? Math.round(
          (
            (income - spending)
            / income
          ) * 100,
        )

      : 0;

  // -------------------------
  // TOP CATEGORY
  // -------------------------

  const categoryMap:
    Record<string, number> = {};

  transactions.forEach(tx => {

    if (tx.type !== 'debit') {
      return;
    }

    categoryMap[tx.category] =

      (categoryMap[tx.category] || 0)

      + tx.amount;
  });

  const topCategory =
    Object.entries(categoryMap)

      .sort(
        (a, b) => b[1] - a[1],
      )[0];

  // -------------------------
  // SAVINGS INSIGHT
  // -------------------------

  insights.push({

    icon:
      savingsRate >= 30
        ? 'shield-check'
        : 'alert-circle',

    text:
      savingsRate >= 30

        ? `Great job! Your savings rate is ${savingsRate}%`

        : `Your savings rate is only ${savingsRate}%`,

    change:
      `₹${income - spending} saved`,

    changePercent:
      savingsRate,

    type:
      savingsRate >= 30
        ? 'info'
        : 'alert',

    cta:
      savingsRate >= 30
        ? 'Keep Saving'
        : 'Reduce Spending',
  });

  // -------------------------
  // TOP SPENDING CATEGORY
  // -------------------------

  if (topCategory) {

    insights.push({

      icon: 'chart-pie',

      text:
        `${topCategory[0]} is your top spending category`,

      change:
        `₹${topCategory[1]} spent`,

      changePercent:
        Math.round(
          (
            topCategory[1]
            / spending
          ) * 100,
        ),

      category:
        topCategory[0],

      type: 'warn',

      cta:
        'View Breakdown',
    });
  }

  // -------------------------
  // SUBSCRIPTIONS
  // -------------------------

  const subscriptions =
    transactions.filter(tx =>

      tx.intent ===
      'subscription',
    );

  if (subscriptions.length > 0) {

    insights.push({

      icon: 'refresh',

      text:
        `${subscriptions.length} active subscriptions detected`,

      change:
        `₹${subscriptions.reduce(
          (sum, tx) =>
            sum + tx.amount,
          0,
        )} recurring`,

      changePercent: 0,

      type: 'info',

      cta:
        'Manage Subscriptions',
    });
  }

  return insights;
};
