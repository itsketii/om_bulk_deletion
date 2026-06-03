"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { listBulkExecutions } from "@/services/bulk.service";
import type { BulkExecution } from "@/types/bulk";

type UseBulkExecutionsOptions = {
  pollIntervalMs?: number;
};

export function useBulkExecutions(options: UseBulkExecutionsOptions = {}) {
  const { pollIntervalMs } = options;
  const [executions, setExecutions] = useState<BulkExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listBulkExecutions();
      if (mounted.current) setExecutions(result);
    } catch (err) {
      if (mounted.current) setError(err as Error);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    return () => {
      mounted.current = false;
    };
  }, [refresh]);

  useEffect(() => {
    if (!pollIntervalMs) return;
    const id = setInterval(() => {
      void refresh();
    }, pollIntervalMs);
    return () => clearInterval(id);
  }, [pollIntervalMs, refresh]);

  return { executions, loading, error, refresh };
}
