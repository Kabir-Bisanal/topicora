"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <html lang="en">
      <body>
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            fontFamily: "system-ui",
            padding: 24,
          }}
        >
          <div style={{ maxWidth: 560, textAlign: "center" }}>
            <h1>Topicora is temporarily unavailable.</h1>
            <p>
              Nothing you entered was lost. Please try loading the publication
              again.
            </p>
            <button type="button" onClick={reset}>
              Reload Topicora
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
