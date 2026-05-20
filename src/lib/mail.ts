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

// ─── Email Template Helpers ───────────────────────────────────────────────────

const BRAND_GREEN = "#1A6B3C";
const BRAND_GOLD = "#C07A1A";
const BRAND_BG = "#F5F5F5";
const BRAND_TEXT = "#1A1A1A";

function baseLayout(title: string, preheader: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND_BG};font-family:'Inter',Arial,sans-serif;color:${BRAND_TEXT};">
  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&zwnj;&zwnj;</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND_BG};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0">

          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND_GREEN};border-radius:12px 12px 0 0;padding:28px 40px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">🦜 AraHaven Aviary</h1>
              <p style="margin:4px 0 0;font-size:11px;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:2px;">Premium Exotic Breeding</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:36px 40px;border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f0f0f0;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center;border:1px solid #e8e8e8;border-top:none;">
              <p style="margin:0;font-size:11px;color:#888888;line-height:1.6;">
                AraHaven Exotic Aviary &bull; CITES Certified Breeder<br/>
                You are receiving this email because of an inquiry or subscription on our website.<br/>
                <a href="https://arahaven.com" style="color:${BRAND_GREEN};text-decoration:none;">arahaven.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Template 1: Inquiry Confirmation (sent to buyer) ─────────────────────────

export interface InquiryConfirmationParams {
  buyerName: string;
  buyerEmail: string;
  parrotNames: string[];
  totalEstimate: number;
  preferredContact: "EMAIL" | "WHATSAPP" | "PHONE";
  locale?: "en" | "fr";
}

export function buildInquiryConfirmationEmail(params: InquiryConfirmationParams): { subject: string; html: string } {
  const { buyerName, parrotNames, totalEstimate, preferredContact, locale = "en" } = params;
  const isFr = locale === "fr";

  const subject = isFr
    ? `Votre demande a été reçue — AraHaven Aviary`
    : `Your Inquiry Has Been Received — AraHaven Aviary`;

  const preheader = isFr
    ? `Merci ${buyerName}, nous avons bien reçu votre demande de réservation.`
    : `Thank you ${buyerName}, we've received your reservation inquiry.`;

  const birdList = parrotNames.map((n) => `<li style="margin:4px 0;color:${BRAND_TEXT};">${n}</li>`).join("");

  const contactMethodLabel: Record<string, string> = {
    WHATSAPP: isFr ? "WhatsApp" : "WhatsApp",
    EMAIL: isFr ? "E-mail" : "E-mail",
    PHONE: isFr ? "Appel téléphonique" : "Phone call",
  };

  const body = isFr ? `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:800;color:${BRAND_GREEN};">Demande reçue !</h2>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#444;">
      Bonjour <strong>${buyerName}</strong>,<br/>
      Nous avons bien reçu votre demande de réservation pour les oiseaux suivants :
    </p>
    <ul style="margin:0 0 20px;padding-left:20px;font-size:14px;">${birdList}</ul>
    <div style="background:${BRAND_BG};border-radius:8px;padding:16px 20px;margin-bottom:20px;border-left:4px solid ${BRAND_GREEN};">
      <p style="margin:0;font-size:13px;color:#555;">
        <strong>Estimation totale :</strong> $${totalEstimate.toLocaleString()} USD<br/>
        <strong>Méthode de contact préférée :</strong> ${contactMethodLabel[preferredContact]}<br/>
      </p>
    </div>
    <p style="font-size:14px;color:#444;line-height:1.6;">
      Notre équipe vous contactera sous 24–48 heures pour finaliser les détails.<br/>
      Pour toute question urgente, écrivez-nous sur WhatsApp.
    </p>
    <a href="https://arahaven.com/catalog" style="display:inline-block;margin-top:20px;padding:12px 28px;background-color:${BRAND_GREEN};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">
      Voir le catalogue
    </a>
  ` : `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:800;color:${BRAND_GREEN};">Inquiry Received!</h2>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#444;">
      Hello <strong>${buyerName}</strong>,<br/>
      We've successfully received your reservation inquiry for the following birds:
    </p>
    <ul style="margin:0 0 20px;padding-left:20px;font-size:14px;">${birdList}</ul>
    <div style="background:${BRAND_BG};border-radius:8px;padding:16px 20px;margin-bottom:20px;border-left:4px solid ${BRAND_GREEN};">
      <p style="margin:0;font-size:13px;color:#555;">
        <strong>Total Estimate:</strong> $${totalEstimate.toLocaleString()} USD<br/>
        <strong>Preferred Contact:</strong> ${contactMethodLabel[preferredContact]}<br/>
      </p>
    </div>
    <p style="font-size:14px;color:#444;line-height:1.6;">
      Our team will reach out within 24–48 hours to finalize the details of your inquiry.<br/>
      For urgent questions, please contact us directly via WhatsApp.
    </p>
    <a href="https://arahaven.com/catalog" style="display:inline-block;margin-top:20px;padding:12px 28px;background-color:${BRAND_GREEN};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">
      Browse Catalog
    </a>
  `;

  return { subject, html: baseLayout(subject, preheader, body) };
}

// ─── Template 2: Admin Notification (new inquiry alert) ───────────────────────

export interface AdminNotificationParams {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerCountry: string;
  parrotNames: string[];
  totalEstimate: number;
  preferredContact: string;
  message?: string;
}

export function buildAdminNotificationEmail(params: AdminNotificationParams): { subject: string; html: string } {
  const { buyerName, buyerEmail, buyerPhone, buyerCountry, parrotNames, totalEstimate, preferredContact, message } = params;

  const subject = `[AraHaven] New Inquiry from ${buyerName} — ${parrotNames.length} bird${parrotNames.length !== 1 ? "s" : ""}`;
  const preheader = `${buyerName} from ${buyerCountry} has submitted a reservation inquiry for ${parrotNames.join(", ")}.`;

  const birdList = parrotNames.map((n) => `<li style="margin:4px 0;">${n}</li>`).join("");

  const body = `
    <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:12px 16px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#856404;font-weight:700;">⚡ New Reservation Inquiry</p>
    </div>

    <h2 style="margin:0 0 16px;font-size:18px;font-weight:800;color:${BRAND_TEXT};">Buyer Details</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;border-collapse:collapse;">
      <tr><td style="padding:6px 12px 6px 0;color:#666;font-weight:600;width:160px;">Name</td><td style="padding:6px 0;color:${BRAND_TEXT};">${buyerName}</td></tr>
      <tr style="background:#f9f9f9;"><td style="padding:6px 12px 6px 0;color:#666;font-weight:600;">Email</td><td style="padding:6px 0;"><a href="mailto:${buyerEmail}" style="color:${BRAND_GREEN};">${buyerEmail}</a></td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#666;font-weight:600;">Phone</td><td style="padding:6px 0;color:${BRAND_TEXT};">${buyerPhone}</td></tr>
      <tr style="background:#f9f9f9;"><td style="padding:6px 12px 6px 0;color:#666;font-weight:600;">Country</td><td style="padding:6px 0;color:${BRAND_TEXT};">${buyerCountry}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#666;font-weight:600;">Preferred Contact</td><td style="padding:6px 0;color:${BRAND_TEXT};">${preferredContact}</td></tr>
    </table>

    <h2 style="margin:24px 0 12px;font-size:18px;font-weight:800;color:${BRAND_TEXT};">Requested Birds</h2>
    <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;color:${BRAND_TEXT};">${birdList}</ul>

    <div style="background:${BRAND_BG};border-radius:8px;padding:12px 16px;margin-bottom:20px;">
      <p style="margin:0;font-size:14px;color:${BRAND_TEXT};">
        <strong>Total Estimate:</strong>
        <span style="color:${BRAND_GOLD};font-weight:800;font-size:16px;"> $${totalEstimate.toLocaleString()} USD</span>
      </p>
    </div>

    ${message ? `
    <h2 style="margin:0 0 8px;font-size:15px;font-weight:700;color:${BRAND_TEXT};">Buyer's Message</h2>
    <blockquote style="margin:0 0 20px;padding:12px 16px;background:#f5f5f5;border-left:4px solid ${BRAND_GREEN};border-radius:0 8px 8px 0;font-size:13px;color:#555;line-height:1.7;">
      ${message}
    </blockquote>
    ` : ""}

    <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://arahaven.com"}/admin/dashboard/messages" style="display:inline-block;padding:12px 28px;background-color:${BRAND_GREEN};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">
      View in Dashboard
    </a>
  `;

  return { subject, html: baseLayout(subject, preheader, body) };
}

// ─── Template 3: Newsletter Welcome (new subscriber) ─────────────────────────

export interface NewsletterWelcomeParams {
  subscriberEmail: string;
  locale?: "en" | "fr";
}

export function buildNewsletterWelcomeEmail(params: NewsletterWelcomeParams): { subject: string; html: string } {
  const { subscriberEmail, locale = "en" } = params;
  const isFr = locale === "fr";

  const subject = isFr
    ? `Bienvenue dans la newsletter AraHaven ! 🦜`
    : `Welcome to the AraHaven Aviary Newsletter! 🦜`;

  const preheader = isFr
    ? `Merci de vous être inscrit(e). Nous vous tiendrons informé des nouvelles naissances et des oiseaux disponibles.`
    : `Thank you for subscribing. We'll keep you updated on new hatchlings and available birds.`;

  const body = isFr ? `
    <h2 style="margin:0 0 12px;font-size:20px;font-weight:800;color:${BRAND_GREEN};">Bienvenue chez AraHaven ! 🌿</h2>
    <p style="font-size:15px;line-height:1.7;color:#444;margin:0 0 20px;">
      Vous êtes maintenant abonné(e) à notre lettre d'information exclusive.<br/>
      Voici ce que vous recevrez :
    </p>
    <ul style="font-size:14px;color:#444;line-height:1.8;margin:0 0 24px;padding-left:20px;">
      <li>Annonces des nouveaux oisillons et oiseaux disponibles</li>
      <li>Résultats ADN et mises à jour de santé</li>
      <li>Guides d'élevage et conseils d'alimentation</li>
      <li>Offres exclusives aux abonnés</li>
    </ul>
    <div style="background:linear-gradient(135deg,#f0faf4,#e8f5ec);border:1px solid #c3e6cb;border-radius:10px;padding:20px 24px;margin-bottom:24px;text-align:center;">
      <p style="margin:0;font-size:13px;color:#2d6a4f;line-height:1.6;">
        <strong>Chez AraHaven</strong>, chaque oiseau est élevé à la main, certifié CITES,<br/>et contrôlé vétérinairement avant de rejoindre sa nouvelle famille.
      </p>
    </div>
    <a href="https://arahaven.com/catalog" style="display:inline-block;margin-right:12px;padding:12px 24px;background-color:${BRAND_GREEN};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">
      Voir les oiseaux disponibles
    </a>
    <a href="https://arahaven.com/blog" style="display:inline-block;padding:12px 24px;background-color:transparent;color:${BRAND_GREEN};text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;border:2px solid ${BRAND_GREEN};">
      Lire notre blog
    </a>
    <p style="margin-top:28px;font-size:11px;color:#aaa;">
      Adresse inscrite : ${subscriberEmail}<br/>
      Pour vous désinscrire, répondez à cet e-mail avec "désabonnement".
    </p>
  ` : `
    <h2 style="margin:0 0 12px;font-size:20px;font-weight:800;color:${BRAND_GREEN};">Welcome to AraHaven! 🌿</h2>
    <p style="font-size:15px;line-height:1.7;color:#444;margin:0 0 20px;">
      You are now subscribed to our exclusive aviary newsletter.<br/>
      Here is what you can expect from us:
    </p>
    <ul style="font-size:14px;color:#444;line-height:1.8;margin:0 0 24px;padding-left:20px;">
      <li>New hatchling announcements and available bird alerts</li>
      <li>DNA result updates and health reports</li>
      <li>Hand-raising guides and feeding schedules</li>
      <li>Exclusive subscriber-only offers</li>
    </ul>
    <div style="background:linear-gradient(135deg,#f0faf4,#e8f5ec);border:1px solid #c3e6cb;border-radius:10px;padding:20px 24px;margin-bottom:24px;text-align:center;">
      <p style="margin:0;font-size:13px;color:#2d6a4f;line-height:1.6;">
        <strong>At AraHaven</strong>, every bird is hand-raised, CITES certified,<br/>and vet-checked before joining its forever family.
      </p>
    </div>
    <a href="https://arahaven.com/catalog" style="display:inline-block;margin-right:12px;padding:12px 24px;background-color:${BRAND_GREEN};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">
      Browse Available Birds
    </a>
    <a href="https://arahaven.com/blog" style="display:inline-block;padding:12px 24px;background-color:transparent;color:${BRAND_GREEN};text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;border:2px solid ${BRAND_GREEN};">
      Read Our Blog
    </a>
    <p style="margin-top:28px;font-size:11px;color:#aaa;">
      Subscribed address: ${subscriberEmail}<br/>
      To unsubscribe, reply to this email with "unsubscribe".
    </p>
  `;

  return { subject, html: baseLayout(subject, preheader, body) };
}
