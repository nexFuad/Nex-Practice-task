"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/error/ErrorDisplay";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <ErrorDisplay
          kind="unexpected"
          error={error}
          onRetry={reset}
          reference={error.digest}
        />
      </body>
    </html>
  );
}
