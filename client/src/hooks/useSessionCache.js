import { useState, useEffect, useRef, useCallback } from 'react'

export default function useSessionCache(key, fetcher, deps = [], maxAge = null) {
  const [data, setData] = useState(() => {
    if (!key) return null
    try {
      const raw = sessionStorage.getItem(key)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (maxAge && parsed?.ts && Date.now() - parsed.ts > maxAge) {
  try { sessionStorage.removeItem(key) } catch { /* ignore */ }
        return null
      }
      return parsed?.value ?? null
    } catch (e) {
      console.warn('sessionStorage parse error for', key, e)
      return null
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const serializedDeps = JSON.stringify(deps || [])

  const doFetch = useCallback(async () => {
    if (!key || typeof fetcher !== 'function') return null
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      if (!mounted.current) return result
      setData(result)
      try { sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), value: result })) } catch (e) { console.warn('sessionStorage set failed', e) }
      return result
    } catch (err) {
      if (!mounted.current) return null
      setError(err)
      return null
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [key, fetcher])

  useEffect(() => {
    if (!key || !fetcher) return
    if (data === null) {
      doFetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, fetcher, serializedDeps])

  const refresh = useCallback(async () => {
    return await doFetch()
  }, [doFetch])

  const clear = useCallback(() => {
    if (!key) return
  try { sessionStorage.removeItem(key) } catch { /* ignore */ }
    setData(null)
  }, [key])

  return { data, loading, error, refresh, clear }
}
