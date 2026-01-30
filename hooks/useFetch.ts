// hooks/useFetchAuth.ts
import { useState, useEffect } from 'react'
import { useAuth } from '../lib/context/AuthContext'

interface FetchState<T> {
  data?: T
  loading: boolean
  error?: any
}

export function useFetch<T>(fetcher: () => Promise<T>, deps: any[] = []) {
  const { refreshAuthToken } = useAuth()
  const [state, setState] = useState<FetchState<T>>({
    data: undefined,
    loading: true,
    error: undefined,
  })

  useEffect(() => {
    let mounted = true
    setState({ data: undefined, loading: true, error: undefined })

    const execute = async () => {
      try {
        const result = await fetcher()
        if (mounted) setState({ data: result, loading: false, error: undefined })
      } catch (err: any) {
        // If 401 Unauthorized, try refreshing the token once
        if (err?.status === 401) {
          try {
            await refreshAuthToken()
            const result = await fetcher()
            if (mounted) setState({ data: result, loading: false, error: undefined })
          } catch (refreshErr) {
            if (mounted) setState({ data: undefined, loading: false, error: refreshErr })
          }
        } else {
          if (mounted) setState({ data: undefined, loading: false, error: err })
        }
      }
    }

    execute()

    return () => {
      mounted = false
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return state
}
