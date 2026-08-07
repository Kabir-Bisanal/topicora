import {
  CalendarClock,
  CircleCheck,
  CircleX,
  LoaderCircle,
} from "lucide-react";

import { requireStaff } from "@/lib/auth/server";
import { getPublicationJobs } from "@/lib/db/admin";
import { formatDate } from "@/lib/utils/date";

const statusIcon = {
  queued: CalendarClock,
  processing: LoaderCircle,
  completed: CircleCheck,
  cancelled: CircleX,
  failed: CircleX,
} as const;

export default async function SchedulePage() {
  await requireStaff("/admin/schedule");
  const jobs = await getPublicationJobs();
  return (
    <div>
      <p className="eyebrow">Publishing operations</p>
      <h1 className="headline-md mt-2">Scheduled publication queue</h1>
      <p className="text-muted-foreground mt-3 max-w-2xl">
        The database controls visibility at the selected instant. This durable
        queue invalidates public caches within the scheduled worker window and
        safely retries transient failures.
      </p>
      <div className="border-border bg-surface mt-8 divide-y rounded-xl border">
        {jobs.map((job) => {
          const Icon =
            statusIcon[job.status as keyof typeof statusIcon] ?? CalendarClock;
          const article = Array.isArray(job.article)
            ? job.article[0]
            : job.article;
          return (
            <div
              className="flex flex-wrap items-center justify-between gap-4 p-5"
              key={job.id}
            >
              <div className="flex items-start gap-3">
                <Icon
                  className="text-accent mt-0.5"
                  aria-hidden="true"
                  size={20}
                />
                <div>
                  <p className="font-bold">
                    {article?.title ?? "Deleted article"}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Runs {formatDate(job.run_at)} · {job.attempts} attempt
                    {job.attempts === 1 ? "" : "s"}
                  </p>
                  {job.last_error ? (
                    <p className="text-danger mt-1 text-xs">{job.last_error}</p>
                  ) : null}
                </div>
              </div>
              <span className="border-border rounded-full border px-3 py-1 text-xs font-bold capitalize">
                {job.status}
              </span>
            </div>
          );
        })}
        {jobs.length === 0 ? (
          <p className="text-muted-foreground p-8 text-center">
            No scheduled publication jobs yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
