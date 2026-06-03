"use client";

import { useCallback, useState } from "react";
import { downloadGeneratedFile } from "@/services/file.service";

export function useFiles() {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const download = useCallback(async (id: number | string, filename: string) => {
    setDownloading(true);
    setError(null);
    try {
      const blob = await downloadGeneratedFile(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err as Error);
    } finally {
      setDownloading(false);
    }
  }, []);

  return { download, downloading, error };
}
