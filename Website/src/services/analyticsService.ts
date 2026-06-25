import api from './Api.client'
import {
  AnalyticsResponse,
  MerchantIntelligenceResponse,
  AIClassificationResponse,
  Period
} from '../types/Api.types'

// ─── ENDPOINTS ────────────────────────────────────────────────────────────────

const ENDPOINTS = {
  analytics:            '/analytics',
  merchantIntelligence: '/analytics/merchants',
  aiClassification:     '/analytics/ai-classification',
} as const

// ─── ANALYTICS SERVICE ────────────────────────────────────────────────────────

export const analyticsService = {
  /**
   * GET /analytics
   *
   * Returns all data required to render the Analytics tab:
   *   - kpi          → three stat cards (avg daily spend, top category, savings rate)
   *   - categoryPie  → spending-by-category pie chart
   *   - monthlyTrend → 6-month expense trend line chart
   *   - incomeExpense→ grouped income-vs-expense bar chart
   *   - topMerchants → horizontal merchant bar chart
   */
  async getAnalytics(period:Period): Promise<AnalyticsResponse> {
    const { data } = await api.get<AnalyticsResponse>(ENDPOINTS.analytics , {
      params :{period}
    })
    return data
  },

  /**
   * GET /analytics/merchants
   *
   * Returns the merchant classification table rendered in the
   * Merchant Intelligence widget — one row per merchant, with the
   * category assigned, the model's confidence, and which classification
   * source produced it.
   */
  async getMerchantIntelligence(period:Period): Promise<MerchantIntelligenceResponse> {
    const { data } = await api.get<MerchantIntelligenceResponse>(ENDPOINTS.merchantIntelligence,{
      params :{period}
    })
    return data
  },

  /**
   * GET /analytics/ai-classification
   *
   * Returns the live classification metrics rendered in the
   * AI Classification Monitor widget:
   *   - transactionsProcessed → headline count + trend for the period
   *   - sources               → per-source usage share (pct) + trend
   */
  async getAIClassification(period:Period): Promise<AIClassificationResponse> {
    const { data } = await api.get<AIClassificationResponse>(ENDPOINTS.aiClassification,{
      params :{period}
    })
    return data
  },
}

// ─── EXPECTED RESPONSE SHAPES ─────────────────────────────────────────────────
//
// GET /analytics
// {
//   "kpi": {
//     "avgDailySpend": "$104.20",
//     "topCategory":   "Food & Drink",
//     "savingsRate":   "41%"
//   },
//   "categoryPie": [
//     { "label": "Food",          "value": 1178, "color": "#F5A800" },
//     { "label": "Transport",     "value": 930,  "color": "#FFD166" },
//     { "label": "Shopping",      "value": 620,  "color": "#E09700" },
//     { "label": "Subscriptions", "value": 235,  "color": "#8B6CD6" },
//     { "label": "Other",         "value": 372,  "color": "#2C1D55" }
//   ],
//   "monthlyTrend": [
//     { "label": "Jul", "value": 2940 },
//     ...
//   ],
//   "incomeExpense": [
//     { "label": "Jul", "income": 7600, "expense": 2940 },
//     ...
//   ],
//   "topMerchants": [
//     { "label": "Rent — Apt 4B",       "value": 1800.00 },
//     { "label": "United Airlines",     "value": 340.00  },
//     { "label": "Whole Foods Market",  "value": 67.40   },
//     { "label": "Netflix Premium",     "value": 22.99   },
//     { "label": "CVS Pharmacy",        "value": 18.50   }
//   ]
// }
//
// GET /analytics/merchants
// {
//   "merchants": [
//     {
//       "id": 1,
//       "merchant": "Whole Foods Market",
//       "category": "Groceries",
//       "confidence": 97,
//       "source": "merchant_prior"
//     },
//     {
//       "id": 9,
//       "merchant": "Uber Trip — Dec 4",
//       "category": "Transport",
//       "confidence": 71,
//       "source": "semantic_ai"
//     },
//     ...
//   ]
// }
// `source` is one of: "merchant_prior" | "keyword_rule" | "database_memory" | "semantic_ai"
//
// GET /analytics/ai-classification
// {
//   "transactionsProcessed": {
//     "count": 1284,
//     "trend": { "direction": "up", "value": "+8.2% vs last month" }
//   },
//   "sources": [
//     { "label": "Keyword Rule",    "pct": 34, "trend": { "direction": "down", "value": "-3.1%" } },
//     { "label": "Merchant Prior",  "pct": 41, "trend": { "direction": "up",   "value": "+2.4%" } },
//     { "label": "Database Memory", "pct": 17, "trend": { "direction": "flat", "value": "0.0%"  } },
//     { "label": "Semantic AI",     "pct": 8,  "trend": { "direction": "up",   "value": "+0.9%" } }
//   ]
// }