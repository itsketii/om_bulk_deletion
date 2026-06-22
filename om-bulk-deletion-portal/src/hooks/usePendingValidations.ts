"use client";

import { useCallback, useEffect, useState } from "react";
import { listPendingValidationUploads } from "@/services/upload.service";
import type { Upload } from "@/types/upload";

export function usePendingValidations() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUploads(await listPendingValidationUploads());
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { uploads, loading, error, refresh };
}
