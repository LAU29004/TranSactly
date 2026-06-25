import { useState, useEffect, useCallback, useRef } from 'react'
import { AxiosError } from 'axios'
import { ApiError } from '../types/Api.types'
import { aiService } from '../services/aiService'
import { AIResponse } from '../types/Api.types'

interface UseApiState<T> {
  data:     T | null
  loading:  boolean
  error:    ApiError | null
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => void
}

/**
 * Generic data-fetching hook.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi(
 *     () => dashboardService.getDashboard(period),
 *     [period]
 *   )
 *
 * - Re-runs automatically when any value in `deps` changes.
 * - Aborts in-flight requests when deps change or component unmounts.
 * - Normalises AxiosError into a plain { message, status } object.
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = [],
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data:    null,
    loading: true,
    error:   null,
  })

  // Track whether the component is still mounted to prevent state updates after unmount
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // Stable refetch counter — increment to trigger a manual re-fetch
  const [tick, setTick] = useState(0)
  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false

    setState((prev) => ({ ...prev, loading: true, error: null }))

    fetcher()
      .then((data) => {
        if (!cancelled && mountedRef.current) {
          setState({ data, loading: false, error: null })
        }
      })
      .catch((err: AxiosError) => {
        if (!cancelled && mountedRef.current) {
          const apiError: ApiError = {
            message: (err.response?.data as any)?.message ?? err.message ?? 'An unexpected error occurred.',
            status:  err.response?.status ?? 0,
          }
          setState({ data: null, loading: false, error: apiError })
        }
      })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return { ...state, refetch }
}

export function useAIChat() {

  const ask = async (
    question: string,
  ): Promise<AIResponse> => {

    return aiService.ask(
      question,
    )
  }

  return {
    ask,
  }
}