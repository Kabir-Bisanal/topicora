"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { if (process.env.NODE_ENV !== "production") console.error(error); }, [error]);
  return <div className="mx-auto max-w-xl px-5 py-24 text-center"><p className="eyebrow">Something went wrong</p><h1 className="headline-md mt-4">We couldn’t load this page.</h1><p className="mt-4 text-muted-foreground">The problem has been contained. Trying again is safe.</p><button className="button-primary mt-7" type="button" onClick={reset}>Try again</button></div>;
}
