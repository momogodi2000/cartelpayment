import type { Config } from "@netlify/functions";

export const config: Config = {
  schedule: "*/15 * * * *", // Every 15 minutes
};

export default async function () {
  const siteUrl = process.env.URL || process.env.NEXT_PUBLIC_SITE_URL || "https://pawelium.fyi";
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET is missing");
    return;
  }

  const res = await fetch(`${siteUrl}/api/internal/cron/reconcile-payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cronSecret}`,
    },
  });

  console.log(`[Scheduled] reconcile-payments status: ${res.status}`);
}
