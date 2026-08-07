import { CampaignEditor } from "@/components/admin/campaign-editor";
import { requireAdmin } from "@/lib/auth/server";
import { getAllCategories } from "@/lib/db/articles";

export default async function NewCampaignPage() {
  await requireAdmin("/admin/campaigns/new");
  const categories = await getAllCategories();
  return (
    <div>
      <p className="eyebrow">New campaign</p>
      <h1 className="headline-md mt-2 mb-8">Compose newsletter</h1>
      <CampaignEditor categories={categories} />
    </div>
  );
}
