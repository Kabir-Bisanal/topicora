import { ArticleEditor } from "@/components/admin/article-editor";
import { getAdminTaxonomy } from "@/lib/db/admin";

export default async function NewArticlePage() {
  const { categories, tags } = await getAdminTaxonomy();
  return <ArticleEditor categories={categories} tags={tags} />;
}
