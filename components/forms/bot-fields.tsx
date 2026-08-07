"use client";

import { useEffect, useRef } from "react";

export function BotFields() {
  const startedAt = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now());
  }, []);
  return (
    <>
      <label
        className="absolute top-auto -left-[10000px] h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <input ref={startedAt} type="hidden" name="startedAt" defaultValue="0" />
    </>
  );
}
