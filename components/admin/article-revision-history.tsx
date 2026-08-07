import { History, RotateCcw } from "lucide-react";

import { restoreArticleRevisionAction } from "@/lib/actions/articles";
import { formatDate } from "@/lib/utils/date";

type Revision = {
  id: string;
  revision_number: number;
  snapshot: unknown;
  created_at: string;
  creator: { display_name: string } | null;
};

export function ArticleRevisionHistory({
  articleId,
  revisions,
}: {
  articleId: string;
  revisions: Revision[];
}) {
  return (
    <section className="border-border bg-surface mt-8 rounded-xl border p-5 sm:p-7">
      <div className="flex items-center gap-3">
        <History className="text-accent" aria-hidden="true" size={22} />
        <div>
          <h2 className="font-serif text-2xl font-semibold">
            Revision history
          </h2>
          <p className="text-muted-foreground text-sm">
            Every saved article state is retained. Restoring creates a new
            revision, so history is never overwritten.
          </p>
        </div>
      </div>
      <div className="border-border mt-5 divide-y border-t">
        {revisions.map((revision, index) => {
          const snapshot = revision.snapshot as {
            title?: string;
            status?: string;
          };
          return (
            <div
              className="flex flex-wrap items-center justify-between gap-4 py-4"
              key={revision.id}
            >
              <div>
                <p className="font-bold">
                  Revision {revision.revision_number}
                  {index === 0 ? " · Current" : ""}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {snapshot.title ?? "Untitled"} · {snapshot.status ?? "draft"}{" "}
                  · {formatDate(revision.created_at)}
                  {revision.creator
                    ? ` · ${revision.creator.display_name}`
                    : " · System"}
                </p>
              </div>
              {index > 0 ? (
                <form
                  action={restoreArticleRevisionAction.bind(
                    null,
                    articleId,
                    revision.id,
                  )}
                >
                  <button className="button-secondary" type="submit">
                    <RotateCcw aria-hidden="true" size={15} /> Restore
                  </button>
                </form>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
