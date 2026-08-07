import { saveSettingsAction } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth/server";
import { getSiteSettings } from "@/lib/db/admin";

export default async function SettingsPage() {
  await requireAdmin("/admin/settings");
  const settings = await getSiteSettings();
  return (
    <div>
      <p className="eyebrow">Publication control</p>
      <h1 className="headline-md mt-2">Settings</h1>
      <form
        action={saveSettingsAction}
        className="border-border bg-surface mt-8 grid max-w-3xl gap-5 rounded-xl border p-6"
      >
        <label className="grid gap-2 text-sm font-bold">
          Publication name
          <input
            className="field"
            name="name"
            defaultValue={settings.publication.name}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Tagline
          <input
            className="field"
            name="tagline"
            defaultValue={settings.publication.tagline}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Slug redirects
          <textarea
            className="field min-h-52 font-mono text-sm"
            name="redirects"
            defaultValue={JSON.stringify(settings.redirects, null, 2)}
            required
          />
          <span className="text-muted-foreground text-xs font-normal">
            JSON array: [{`{ "from": "/articles/old", "to": "/articles/new" }`}]
          </span>
        </label>
        <button className="button-primary justify-self-start" type="submit">
          Save settings
        </button>
      </form>
    </div>
  );
}
