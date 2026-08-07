import { Trash2 } from "lucide-react";

import { deleteTagAction, saveTagAction } from "@/lib/actions/taxonomy";
import { getAdminTaxonomy } from "@/lib/db/admin";

export default async function TagsPage() {
  const { tags } = await getAdminTaxonomy();
  return <div><p className="eyebrow">Taxonomy</p><h1 className="headline-md mt-2">Tags</h1><p className="mt-3 text-muted-foreground">Maintain focused labels readers can use across categories.</p><form action={saveTagAction} className="mt-8 grid gap-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-[1fr_1fr_auto]"><label className="grid gap-1 text-xs font-bold">Name<input className="field" name="name" required /></label><label className="grid gap-1 text-xs font-bold">Slug<input className="field" name="slug" required /></label><button className="button-primary self-end" type="submit">Add tag</button></form><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{tags.map((item) => <form action={saveTagAction} className="grid grid-cols-[1fr_auto] gap-3 rounded-xl border border-border bg-surface p-4" key={item.id}><input type="hidden" name="id" value={item.id} /><label className="grid gap-2 text-xs font-bold">Name<input className="field" name="name" defaultValue={item.name} required /></label><label className="grid gap-2 text-xs font-bold">Slug<input className="field" name="slug" defaultValue={item.slug} required /></label><button className="button-secondary" type="submit">Save</button><button className="button-ghost size-11 p-0 text-danger" formAction={deleteTagAction.bind(null, item.id)} aria-label={`Delete ${item.name}`}><Trash2 aria-hidden="true" size={17} /></button></form>)}</div></div>;
}
