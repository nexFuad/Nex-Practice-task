"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/error/ErrorDisplay";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorDisplay kind="unexpected" error={error} onRetry={reset} reference={error.digest} />;
}
