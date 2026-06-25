import { useCallback, useState } from 'react'
import { useApi } from './useApi'
import { dashboardService } from '../services/dashboardService'
import { analyticsService } from '../services/analyticsService'
import { subscriptionService, goalsService } from '../services/subscriptionService'
import {
  Period,
  Goal,
  GoalsResponse,
  ApiError,
} from '../types/Api.types'

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

export function useDashboard(period: Period) {
  return useApi(
    () => dashboardService.getDashboard(period),
    [period],
  )
}

export function useOverviewKPI(
  period: Period
) {
  return useApi(
    () => dashboardService.getOverviewKPI(period),
    [period],
  )
}

export function useTransactions() {
  return useApi(() => dashboardService.getTransactions(), [])
}

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

export function useAnalytics(
  period: Period
) {
  return useApi(
    () => analyticsService.getAnalytics(period),
    [period],
  )
}
export function useMerchantIntelligence(
  period: Period
) {
  return useApi(
    () =>
      analyticsService.getMerchantIntelligence(
        period
      ),
    [period],
  )
}

export function useAIClassification(
  period: Period
) {
  return useApi(
    () =>
      analyticsService.getAIClassification(
        period
      ),
    [period],
  )
}
// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────

export function useSubscriptions() {
  return useApi(() => subscriptionService.getSubscriptions(), [])
}

// ─── GOALS (with optimistic mutations) ───────────────────────────────────────

/**
 * useGoals
 *
 * Provides CRUD operations on top of the base useApi hook.
 * Optimistic updates keep the UI snappy — we update local state immediately,
 * then reconcile with the server response (or rollback on error).
 */
