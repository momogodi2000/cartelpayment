import dotenv from "dotenv";
dotenv.config();

const task = process.argv[2];

if (!task) {
  console.error("Usage: tsx scripts/cron-runner.ts <expire-reservations | email-outbox | cleanup-sessions>");
  process.exit(1);
}

async function main() {
  const cronSecret = process.env.CRON_SECRET || "sample_cron_secret_change_me_in_production";
  const port = process.env.PORT || 3000;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:${port}`;
  const endpoint = `${baseUrl}/api/internal/cron/${task}`;

  console.log(`[Cron Runner] Invoking ${endpoint}...`);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json().catch(() => ({}));
    console.log(`[Cron Runner] Status: ${res.status}`);
    console.log("[Cron Runner] Response:", JSON.stringify(data, null, 2));

    if (!res.ok) {
      process.exit(1);
    }
  } catch (error: any) {
    console.error(`[Cron Runner] Failed to connect to server: ${error.message}`);
    console.log("Tip: Ensure 'npm run dev' or 'npm run start' is running when invoking via HTTP.");
  }
}

main();
