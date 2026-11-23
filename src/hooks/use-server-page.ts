"use client";

import * as React from "react";
import type { PageResponse } from "@/types/api";

type PageQuery = Record<string, string | number | undefined>;

/** Loads one backend page whenever the page, size, or filters change. */
export function useServerPage<T>(
  load: (query: PageQuery) => Promise<PageResponse<T>>,
  filters: PageQuery,
  page: number,
  size: number,
) {
  const [result, setResult] = React.useState<{
    key: string;
    data: PageResponse<T>;
    error: unknown;
  } | null>(null);
  const [revision, setRevision] = React.useState(0);
  const loadRef = React.useRef(load);
  React.useEffect(() => { loadRef.current = load; }, [load]);
  const filterKey = JSON.stringify(filters);
  const requestKey = JSON.stringify([filterKey, page, size, revision]);

  React.useEffect(() => {
    let active = true;
    void loadRef.current({ ...JSON.parse(filterKey) as PageQuery, page: page - 1, size })
      .then((response) => { if (active) setResult({ key: requestKey, data: response, error: null }); })
      .catch((reason: unknown) => {
        if (!active) return;
        setResult({ key: requestKey, error: reason, data: { content: [], page: page - 1, size, totalElements: 0, totalPages: 0 } });
      });
    return () => { active = false; };
  }, [filterKey, page, size, revision, requestKey]);

  const reload = React.useCallback(() => setRevision((value) => value + 1), []);
  const current = result?.key === requestKey ? result : null;
  const data = result?.data ?? { content: [], page: page - 1, size, totalElements: 0, totalPages: 0 };
  return { data, loading: current === null, error: current?.error ?? null, reload };
}
