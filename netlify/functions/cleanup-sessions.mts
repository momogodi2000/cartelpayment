import type { Config } from "@netlify/functions";

export const config: Config = {
  schedule: "0 * * * *", // Every hour
};

export default async function () {
  const siteUrl = process.env.URL || process.env.NEXT_PUBLIC_SITE_URL || "https://pawelium.fyi";
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET is missing");
    return;
  }

  const res = await fetch(`${siteUrl}/api/internal/cron/cleanup-sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cronSecret}`,
    },
  });

  console.log(`[Scheduled] cleanup-sessions status: ${res.status}`);
}
