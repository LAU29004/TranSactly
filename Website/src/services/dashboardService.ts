import api from './Api.client'
import {
  DashboardResponse,
  OverviewKPIResponse,
  Period,
  Transaction,
} from '../types/Api.types'

// ─── ENDPOINTS ────────────────────────────────────────────────────────────────

const ENDPOINTS = {
  dashboard:    '/dashboard',
  overviewKPI:  '/dashboard/kpi',
  transactions: '/dashboard/transactions',
} as const

// ─── DASHBOARD SERVICE ────────────────────────────────────────────────────────

export const dashboardService = {
  /**
   * GET /dashboard?period=month|6months|1year
   *
   * Returns period-specific summary cards, bar chart months,
   * donut segments and AI insights for the overview tab.
   */
  async getDashboard(period: Period): Promise<DashboardResponse> {
    const { data } = await api.get<DashboardResponse>(ENDPOINTS.dashboard, {
      params: { period },
    })
    return data
  },

  /**
   * GET /dashboard/kpi
   *
   * Returns the four static KPI cards shown above the overview tab
   * (Transactions Processed, Savings Rate, AI Accuracy, Active Subscriptions).
   */
 async getOverviewKPI(
  period: Period
): Promise<OverviewKPIResponse> {
    const { data } = await api.get<OverviewKPIResponse>(ENDPOINTS.overviewKPI,
       {
      params: { period },
    }
  )
    return data
  },

  /**
   * GET /dashboard/transactions
   *
   * Returns all transactions. Filtering (category, type, date range)
   * is done client-side so the full list is fetched once and memoised.
   */
  async getTransactions(): Promise<Transaction[]> {
    const { data } = await api.get<Transaction[]>(ENDPOINTS.transactions)
    return data
  },
}

// ─── EXPECTED RESPONSE SHAPES (for backend contract reference) ────────────────
//
// GET /dashboard?period=month
// {
//   "period": "month",
//   "data": {
//     "summaryCards": [
//       { "label": "Total Balance", "value": "$24,891", "sub": "↑ 12.4% vs last month", "subType": "up", "icon": "◈" },
//       ...
//     ],
//     "months": [
//       { "label": "W1", "income": 72, "spend": 28 },
//       ...
//     ],
//     "donut": [
//       { "pct": 38, "label": "Food", "amount": "$1,178" },
//       ...
//     ],
//     "insights": [
//       { "type": "spending", "title": "Spending Alert", "description": "...", "confidence": 92 },
//       ...
//     ]
//   }
// }
//
// GET /dashboard/transactions
// [
//   { "id": 1, "icon": "🛒", "name": "Whole Foods Market", "category": "Groceries",
//     "date": "Today, 2:14 PM", "amount": -67.40, "dateVal": "2024-12-06T00:00:00.000Z", "type": "debit" },
//   ...
// ]