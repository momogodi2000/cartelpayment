import nodemailer from "nodemailer";

interface SendMailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || "nursery@arahaven.com";
  const secure = process.env.SMTP_SECURE === "true";

  // Check if SMTP is configured. If not, log to console in development
  if (!host || !user || user.includes("mock_user")) {
    console.log("=========================================");
    console.log(`[SMTP MOCK] Email Sent Successfully`);
    console.log(`From: ${from}`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body (HTML length): ${html.length} chars`);
    console.log("=========================================");
    return { success: true, messageId: "mock-message-id-" + Date.now() };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log(`[SMTP INFO] Mail dispatched successfully. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: unknown) {
    console.error(`[SMTP ERROR] Failed to dispatch email to ${to}:`, error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown SMTP error" };
  }
}
