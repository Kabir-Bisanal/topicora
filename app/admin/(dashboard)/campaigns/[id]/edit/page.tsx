import { notFound } from "next/navigation";

import { CampaignEditor } from "@/components/admin/campaign-editor";
import { requireAdmin } from "@/lib/auth/server";
import { getAllCategories } from "@/lib/db/articles";
import { getCampaign } from "@/lib/db/admin";

export default async function EditCampaignPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  await requireAdmin(`/admin/campaigns/${id}/edit`);
  const [campaign, categories, query] = await Promise.all([
    getCampaign(id),
    getAllCategories(),
    searchParams,
  ]);
  if (!campaign) notFound();
  return (
    <div>
      {query.saved ? (
        <p
          className="border-accent/30 bg-accent/10 text-accent mb-5 rounded-lg border p-3 text-sm font-bold"
          role="status"
        >
          Campaign saved.
        </p>
      ) : null}
      <p className="eyebrow">Campaign</p>
      <h1 className="headline-md mt-2 mb-8">{campaign.subject}</h1>
      <CampaignEditor campaign={campaign} categories={categories} />
    </div>
  );
}
