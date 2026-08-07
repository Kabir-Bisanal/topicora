import { Trash2 } from "lucide-react";

import {
  deleteCategoryAction,
  saveCategoryAction,
} from "@/lib/actions/taxonomy";
import { getAdminTaxonomy } from "@/lib/db/admin";

export default async function CategoriesPage() {
  const { categories } = await getAdminTaxonomy();
  return (
    <div>
      <p className="eyebrow">Taxonomy</p>
      <h1 className="headline-md mt-2">Categories</h1>
      <p className="text-muted-foreground mt-3">
        Manage the five editorial desks and their archive descriptions.
      </p>
      <form
        action={saveCategoryAction}
        className="border-border bg-surface mt-8 grid gap-4 rounded-xl border p-5 lg:grid-cols-[1fr_1fr_2fr_7rem_auto]"
      >
        <label className="grid gap-1 text-xs font-bold">
          Name
          <input className="field" name="name" required />
        </label>
        <label className="grid gap-1 text-xs font-bold">
          Slug
          <input
            className="field"
            name="slug"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
          />
        </label>
        <label className="grid gap-1 text-xs font-bold">
          Description
          <input className="field" name="description" minLength={20} required />
        </label>
        <label className="grid gap-1 text-xs font-bold">
          Order
          <input
            className="field"
            name="sort_order"
            type="number"
            min="0"
            defaultValue="0"
            required
          />
        </label>
        <button className="button-primary self-end" type="submit">
          Add category
        </button>
      </form>
      <div className="mt-5 grid gap-3">
        {categories.map((item) => (
          <form
            action={saveCategoryAction}
            className="border-border bg-surface grid gap-3 rounded-xl border p-4 lg:grid-cols-[1fr_1fr_2fr_6rem_auto]"
            key={item.id}
          >
            <input type="hidden" name="id" value={item.id} />
            <label>
              <span className="sr-only">Name</span>
              <input
                className="field"
                name="name"
                defaultValue={item.name}
                required
              />
            </label>
            <label>
              <span className="sr-only">Slug</span>
              <input
                className="field"
                name="slug"
                defaultValue={item.slug}
                required
              />
            </label>
            <label>
              <span className="sr-only">Description</span>
              <input
                className="field"
                name="description"
                defaultValue={item.description}
                required
              />
            </label>
            <label>
              <span className="sr-only">Order</span>
              <input
                className="field"
                name="sort_order"
                type="number"
                defaultValue={item.sort_order}
                required
              />
            </label>
            <div className="flex gap-2">
              <button className="button-secondary" type="submit">
                Save
              </button>
              <button
                className="button-ghost text-danger size-11 p-0"
                formAction={deleteCategoryAction.bind(null, item.id)}
                aria-label={`Delete ${item.name}`}
              >
                <Trash2 aria-hidden="true" size={17} />
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
