import { processDueCampaigns } from "@/lib/jobs/campaigns";
import { authorizeCronRequest } from "@/lib/security/cron";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function run(request: Request) {
  if (!authorizeCronRequest(request, process.env.CRON_SECRET))
    return Response.json({ ok: false }, { status: 401 });
  const result = await processDueCampaigns();
  return Response.json(result, {
    status: result.ok ? 200 : 503,
    headers: { "cache-control": "no-store" },
  });
}

export const GET = run;
export const POST = run;
