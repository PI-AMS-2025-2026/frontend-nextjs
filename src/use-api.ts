"use client";

import { useState, useEffect, useCallback } from "react";
import { ApiError } from "@/lib/api";

export function useApi<T>(fetchFn: () => Promise<T>, autoFetch = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
      return result;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Ocorreu um erro ao carregar os dados.";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    if (autoFetch) {
      execute();
    }
  }, [autoFetch, execute]);

  return { data, setData, loading, error, refetch: execute };
}
