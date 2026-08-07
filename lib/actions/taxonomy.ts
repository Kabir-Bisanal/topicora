"use server";

import { revalidatePath } from "next/cache";

import { requireStaff } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { categoryInputSchema, tagInputSchema } from "@/lib/validation/taxonomy";

export async function saveCategoryAction(formData: FormData) {
  await requireStaff("/admin/categories");
  const parsed = categoryInputSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    sortOrder: formData.get("sort_order"),
  });
  if (!parsed.success) return;
  const supabase = await createClient();
  if (!supabase) return;
  const record = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    sort_order: parsed.data.sortOrder,
  };
  if (parsed.data.id)
    await supabase.from("categories").update(record).eq("id", parsed.data.id);
  else await supabase.from("categories").insert(record);
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function deleteCategoryAction(id: string, _formData: FormData) {
  void _formData;
  await requireStaff("/admin/categories");
  const parsed = categoryInputSchema.shape.id.safeParse(id);
  if (!parsed.success || !id) return;
  const supabase = await createClient();
  await supabase?.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
}

export async function saveTagAction(formData: FormData) {
  await requireStaff("/admin/tags");
  const parsed = tagInputSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    slug: formData.get("slug"),
  });
  if (!parsed.success) return;
  const supabase = await createClient();
  if (!supabase) return;
  const record = { name: parsed.data.name, slug: parsed.data.slug };
  if (parsed.data.id)
    await supabase.from("tags").update(record).eq("id", parsed.data.id);
  else await supabase.from("tags").insert(record);
  revalidatePath("/admin/tags");
}

export async function deleteTagAction(id: string, _formData: FormData) {
  void _formData;
  await requireStaff("/admin/tags");
  const parsed = tagInputSchema.shape.id.safeParse(id);
  if (!parsed.success || !id) return;
  const supabase = await createClient();
  await supabase?.from("tags").delete().eq("id", id);
  revalidatePath("/admin/tags");
}
