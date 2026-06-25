import api from './Api.client'
import {
  SubscriptionsResponse,
} from '../types/Api.types'

// ─── ENDPOINTS ────────────────────────────────────────────────────────────────

const ENDPOINTS = {
  subscriptions: '/subscriptions',
  goals:         '/goals',
} as const

// ─── SUBSCRIPTIONS SERVICE ────────────────────────────────────────────────────

export const subscriptionService = {
  /**
   * GET /subscriptions
   *
   * Returns the full subscription list plus pre-computed monthly/yearly totals.
   * Status values: 'active' | 'due_soon' | 'overdue'
   */
  async getSubscriptions(): Promise<SubscriptionsResponse> {
    const { data } = await api.get<SubscriptionsResponse>(ENDPOINTS.subscriptions)
    return data
  },
}

// ─── GOALS SERVICE ────────────────────────────────────────────────────────────

export const goalsService = {
  /**
   * GET /goals
   *
   * Returns all goals plus aggregate totals (totalTarget, totalSaved, overallPct).
   */

  /**
   * POST /goals
   *
   * Create a new goal. Returns the created Goal with server-assigned id.
   */

  /**
   * PATCH /goals/:id
   *
   * Partial update — send only changed fields.
   */

  /**
   * DELETE /goals/:id
   */
  async deleteGoal(id: string): Promise<void> {
    await api.delete(`${ENDPOINTS.goals}/${id}`)
  },
}

// ─── EXPECTED RESPONSE SHAPES ─────────────────────────────────────────────────
//
// GET /subscriptions
// {
//   "subscriptions": [
//     { "id": 1, "name": "Netflix", "icon": "N", "iconBg": "#E50914",
//       "monthlyCost": 22.99, "renewalDate": "Dec 30", "status": "active" },
//     ...
//   ],
//   "monthlyTotal": 63.96,
//   "yearlyTotal":  767.52
// }
//
// GET /goals
// {
//   "goals": [
//     { "id": "macbook", "title": "MacBook Goal", "icon": "💻",
//       "target": 2400, "current": 1560, "deadline": "Target: Mar 2025",
//       "note": "MacBook Pro 14\" — saving from monthly surplus." },
//     ...
//   ],
//   "totalTarget": 22400,
//   "totalSaved":  15110,
//   "overallPct":  67
// }