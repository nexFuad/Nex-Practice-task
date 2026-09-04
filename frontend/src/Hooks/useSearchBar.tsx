"use client";

import { useEffect, useState } from "react";

/** Reusable search state for inputs whose results are loaded through TanStack Query. */
export function useSearchBar(initialValue = "", debounceMs = 300) {
  const [query, setQuery] = useState(initialValue);
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedQuery(query.trim()),
      debounceMs,
    );
    return () => window.clearTimeout(timer);
  }, [debounceMs, query]);

  return { query, debouncedQuery, setQuery, clear: () => setQuery("") };
}
