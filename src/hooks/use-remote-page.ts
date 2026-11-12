"use client";

import * as React from "react";
import type { PageResponse } from "@/types/api";

export function useRemotePage<T, F extends object>(
    loadPage: (params: F & { page: number; size: number }) => Promise<PageResponse<T>>,
    filters: F,
    page: number,
    size: number,
    refreshKey = 0,
) {
    const [result, setResult] = React.useState<PageResponse<T> | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const filterKey = JSON.stringify(filters);
    const debouncedFilterKey = useDebouncedValue(filterKey, 300);
    const requestId = React.useRef(0);

    React.useEffect(() => {
        if (debouncedFilterKey !== filterKey) return;
        const currentRequest = ++requestId.current;
        setLoading(true);
        setError(null);

        void loadPage({
            ...(JSON.parse(debouncedFilterKey) as F),
            page: page - 1,
            size,
        }).then((response) => {
            if (requestId.current === currentRequest) setResult(response);
        }).catch((cause: unknown) => {
            if (requestId.current === currentRequest) {
                setError(cause instanceof Error ? cause.message : "Não foi possível carregar os dados.");
            }
        }).finally(() => {
            if (requestId.current === currentRequest) setLoading(false);
        });

        return () => { requestId.current += 1; };
    }, [loadPage, page, size, filterKey, debouncedFilterKey, refreshKey]);

    return {
        content: result?.content ?? [],
        totalElements: result?.totalElements ?? 0,
        totalPages: result?.totalPages ?? 0,
        loading,
        error,
    };
}

export function useDebouncedValue<T>(value: T, delayMs = 300) {
    const [debounced, setDebounced] = React.useState(value);
    React.useEffect(() => {
        const timer = window.setTimeout(() => setDebounced(value), delayMs);
        return () => window.clearTimeout(timer);
    }, [value, delayMs]);
    return debounced;
}
