import { updateSubscriberStatusAction } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth/server";
import { getSubscribers } from "@/lib/db/admin";
import { formatDate } from "@/lib/utils/date";

export default async function SubscribersPage() {
  await requireAdmin("/admin/subscribers");
  const subscribers = await getSubscribers();
  return (
    <div>
      <p className="eyebrow">Audience</p>
      <h1 className="headline-md mt-2">Newsletter subscribers</h1>
      <p className="text-muted-foreground mt-3">
        Subscriber addresses are restricted to administrators.
      </p>
      <div className="border-border bg-surface mt-8 overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="border-border bg-muted border-b text-left">
            <tr>
              <th className="p-4">Email</th>
              <th className="p-4">Source</th>
              <th className="p-4">Subscribed</th>
              <th className="p-4">Preferences</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {subscribers.map((item) => (
              <tr key={item.id}>
                <td className="p-4 font-bold">{item.email}</td>
                <td className="p-4">{item.source}</td>
                <td className="p-4">{formatDate(item.subscribed_at)}</td>
                <td className="p-4 text-xs">
                  <span className="font-bold capitalize">{item.frequency}</span>
                  <br />
                  <span className="text-muted-foreground">
                    {item.topic_slugs.length
                      ? item.topic_slugs.join(", ")
                      : "All topics"}
                  </span>
                </td>
                <td className="p-4">
                  <form
                    action={updateSubscriberStatusAction}
                    className="flex gap-2"
                  >
                    <input type="hidden" name="id" value={item.id} />
                    <select
                      className="field min-h-10"
                      name="status"
                      defaultValue={item.status}
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="unsubscribed">Unsubscribed</option>
                    </select>
                    <button className="button-secondary" type="submit">
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subscribers.length === 0 ? (
          <p className="text-muted-foreground p-8 text-center">
            No subscribers yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
