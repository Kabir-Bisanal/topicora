import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  path,
  query = {},
}: {
  page: number;
  totalPages: number;
  path: string;
  query?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  const href = (value: number) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, item]) => item && params.set(key, item));
    params.set("page", String(value));
    return `${path}?${params.toString()}`;
  };
  return (
    <nav className="mt-12 flex items-center justify-between border-t border-border pt-6" aria-label="Pagination">
      {page > 1 ? (
        <Link className="button-secondary" href={href(page - 1)}>
          <ArrowLeft aria-hidden="true" size={16} /> Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link className="button-secondary" href={href(page + 1)}>
          Next <ArrowRight aria-hidden="true" size={16} />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
