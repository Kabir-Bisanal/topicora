import { updateMessageStatusAction } from "@/lib/actions/admin";
import { getContactMessages } from "@/lib/db/admin";
import { formatDate } from "@/lib/utils/date";

export default async function MessagesPage() {
  const messages = await getContactMessages();
  return (
    <div>
      <p className="eyebrow">Audience inbox</p>
      <h1 className="headline-md mt-2">Messages</h1>
      <div className="mt-8 grid gap-4">
        {messages.map((message) => (
          <article
            className="border-border bg-surface rounded-xl border p-5"
            key={message.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow">{message.reason}</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold">
                  {message.subject}
                </h2>
                <p className="text-muted-foreground mt-1 text-xs">
                  {message.name} · {message.email} ·{" "}
                  {formatDate(message.created_at)}
                </p>
              </div>
              <form action={updateMessageStatusAction}>
                <input type="hidden" name="id" value={message.id} />
                <label>
                  <span className="sr-only">Message status</span>
                  <select
                    className="field"
                    name="status"
                    defaultValue={message.status}
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </label>
                <button className="button-secondary mt-2 w-full" type="submit">
                  Update
                </button>
              </form>
            </div>
            <p className="mt-5 max-w-3xl text-sm leading-7 whitespace-pre-wrap">
              {message.message}
            </p>
            {message.article_url ? (
              <p className="text-muted-foreground mt-3 text-xs">
                Article: {message.article_url}
              </p>
            ) : null}
          </article>
        ))}
        {messages.length === 0 ? (
          <div className="border-border bg-surface text-muted-foreground rounded-xl border p-8">
            No messages have arrived yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}
