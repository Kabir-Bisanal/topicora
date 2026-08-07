"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
