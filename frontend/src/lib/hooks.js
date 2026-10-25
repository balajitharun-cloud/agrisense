import { useCallback, useEffect, useRef, useState } from 'react';

// Runs an async function on mount / when deps change, with a `reload`.
export function useAsync(fn, deps = [], { immediate = true } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const ref = useRef(fn);
  ref.current = fn;

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ref.current();
      setData(result);
      return result;
    } catch (e) {
      setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (immediate) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading, reload: run, setData };
}

// Polls an async function at an interval (real-time feel for sensors).
export function usePoll(fn, intervalMs = 8000, deps = []) {
  const { data, error, loading, reload, setData } = useAsync(fn, deps);
  useEffect(() => {
    const id = setInterval(() => { reload(); }, intervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...deps]);
  return { data, error, loading, reload, setData };
}
