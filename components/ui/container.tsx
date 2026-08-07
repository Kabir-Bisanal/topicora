import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-(--content-width) px-5 sm:px-7", className)} {...props} />;
}
