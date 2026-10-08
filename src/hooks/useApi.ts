import { useState, useEffect, useCallback } from 'react';

export function useApi<T>(fetcher: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e: any) {
      setError(e.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, isLoading, error, refetch: execute };
}
