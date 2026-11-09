import { escapeHtml } from "@/lib/security/html-escape";

export interface EmailRenderResult {
  subject: string;
  html: string;
  text: string;
}

export function renderEmail(template: string, locale: string, payload: Record<string, any>): EmailRenderResult {
  const isFr = locale === "fr";

  switch (template) {
    case "order_pending": {
      const orderRef = escapeHtml(payload.orderRef);
      const animalName = escapeHtml(payload.animalName);
      const total = escapeHtml(payload.total);
      const checkoutUrl = escapeHtml(payload.checkoutUrl);

      const subject = isFr
        ? `Votre réservation Pawelium [${orderRef}] – En attente de règlement`
        : `Your Pawelium Reservation [${orderRef}] – Awaiting Payment`;

      const text = isFr
        ? `Bonjour ${escapeHtml(payload.customerName)},\n\nVotre réservation pour ${animalName} est initiée.\nRéférence: ${orderRef}\nMontant: ${total}\n\nFinalisez votre paiement : ${checkoutUrl}\nCette réservation expire dans 30 minutes.`
        : `Hello ${escapeHtml(payload.customerName)},\n\nYour reservation for ${animalName} is initiated.\nReference: ${orderRef}\nTotal: ${total}\n\nComplete payment: ${checkoutUrl}\nThis reservation expires in 30 minutes.`;

      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #202823; line-height: 1.6;">
          <h2 style="color: #183C32;">Pawelium Concierge</h2>
          <p>${isFr ? "Bonjour" : "Hello"} <strong>${escapeHtml(payload.customerName)}</strong>,</p>
          <p>${isFr ? `Votre réservation pour <strong>${animalName}</strong> est active.` : `Your reservation for <strong>${animalName}</strong> is active.`}</p>
          <div style="background: #F8F6F0; border-left: 4px solid #B69A65; padding: 16px; margin: 20px 0;">
            <p style="margin: 0;"><strong>${isFr ? "Référence" : "Reference"}:</strong> ${orderRef}</p>
            <p style="margin: 5px 0 0 0;"><strong>${isFr ? "Montant" : "Total"}:</strong> ${total}</p>
          </div>
          <p>
            <a href="${checkoutUrl}" style="display: inline-block; background: #183C32; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              ${isFr ? "Finaliser le paiement sécurisé" : "Complete Secure Payment"}
            </a>
          </p>
          <p style="font-size: 13px; color: #666;">${isFr ? "Cette réservation est temporairement garantie pendant 30 minutes." : "This hold is guaranteed for 30 minutes."}</p>
        </div>
      `;
      return { subject, html, text };
    }

    case "order_paid": {
      const orderRef = escapeHtml(payload.orderRef);
      const animalName = escapeHtml(payload.animalName);
      const trackingUrl = escapeHtml(payload.trackingUrl);

      const subject = isFr
        ? `Confirmation de commande Pawelium [${orderRef}] – Paiement validé`
        : `Pawelium Order Confirmation [${orderRef}] – Payment Confirmed`;

      const text = isFr
        ? `Félicitations !\nVotre commande [${orderRef}] pour ${animalName} est confirmée.\nNos équipes vétérinaires préparent le dossier et le protocole de transport.\nSuivi : ${trackingUrl}`
        : `Congratulations!\nYour order [${orderRef}] for ${animalName} is confirmed.\nOur veterinary team is preparing documentation and transport protocol.\nTrack order: ${trackingUrl}`;

      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #202823; line-height: 1.6;">
          <h2 style="color: #183C32;">Pawelium Concierge</h2>
          <p style="color: #183C32; font-size: 18px; font-weight: bold;">${isFr ? "Paiement validé avec succès" : "Payment Successfully Confirmed"}</p>
          <p>${isFr ? `Nous avons le plaisir de vous confirmer l'adoption de <strong>${animalName}</strong>.` : `We are pleased to confirm your adoption of <strong>${animalName}</strong>.`}</p>
          <div style="background: #F8F6F0; border-left: 4px solid #183C32; padding: 16px; margin: 20px 0;">
            <p style="margin: 0;"><strong>${isFr ? "Référence commande" : "Order Reference"}:</strong> ${orderRef}</p>
          </div>
          <p>${isFr ? "Vous pouvez suivre les étapes de validation vétérinaire et d'acheminement à tout moment :" : "You can track veterinary verification and transit milestones at any time:"}</p>
          <p>
            <a href="${trackingUrl}" style="display: inline-block; background: #183C32; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              ${isFr ? "Accéder au suivi en direct" : "Access Live Tracking"}
            </a>
          </p>
        </div>
      `;
      return { subject, html, text };
    }

    case "tracking_otp": {
      const code = escapeHtml(payload.code);
      const subject = isFr ? `Votre code d'accès de suivi Pawelium : ${code}` : `Your Pawelium Tracking Code: ${code}`;
      const text = isFr
        ? `Votre code d'accès confidentiel pour suivre votre commande est : ${code}\nCe code est valable 10 minutes.`
        : `Your confidential access code to track your order is: ${code}\nThis code is valid for 10 minutes.`;

      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #202823; line-height: 1.6;">
          <h2 style="color: #183C32;">Pawelium</h2>
          <p>${isFr ? "Voici votre code de vérification pour accéder à votre espace de suivi :" : "Here is your verification code to access your tracking portal:"}</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #183C32; background: #F8F6F0; padding: 16px; text-align: center; border-radius: 6px; margin: 20px 0;">
            ${code}
          </div>
          <p style="font-size: 13px; color: #666;">${isFr ? "Ce code expire dans 10 minutes. Ne le transmettez à personne." : "This code expires in 10 minutes. Never share it."}</p>
        </div>
      `;
      return { subject, html, text };
    }

    case "support_ticket_created": {
      const ref = escapeHtml(payload.ticketRef);
      const subject = isFr ? `Demande d'assistance prise en compte [${ref}]` : `Support Request Received [${ref}]`;
      const ticketUrl = escapeHtml(payload.ticketUrl);
      const text = isFr
        ? `Bonjour,\nVotre demande [${ref}] a bien été enregistrée par notre équipe.\nAccédez à votre fil de discussion : ${ticketUrl}`
        : `Hello,\nYour support request [${ref}] has been received.\nAccess your discussion thread: ${ticketUrl}`;

      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #202823; line-height: 1.6;">
          <h2 style="color: #183C32;">Pawelium Support Concierge</h2>
          <p>${isFr ? "Votre demande a bien été transmise à notre service dédié." : "Your request has been forwarded to our dedicated support team."}</p>
          <p><strong>${isFr ? "Numéro de ticket" : "Ticket Reference"}:</strong> ${ref}</p>
          <p>
            <a href="${ticketUrl}" style="display: inline-block; background: #183C32; color: #FFFFFF; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
              ${isFr ? "Consulter votre demande" : "View Your Request"}
            </a>
          </p>
        </div>
      `;
      return { subject, html, text };
    }

    case "admin_password_reset": {
      const resetUrl = escapeHtml(payload.resetUrl);
      const subject = "Pawelium Admin — Password Reset Request";
      const text = `A password reset was requested for your Pawelium Super Admin account.\nReset link (valid 30 minutes): ${resetUrl}`;
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #202823; line-height: 1.6;">
          <h2 style="color: #183C32;">Pawelium Security</h2>
          <p>A password reset has been requested for your Super Admin account.</p>
          <p>Click the secure link below to update your password (valid for 30 minutes):</p>
          <p><a href="${resetUrl}" style="display: inline-block; background: #183C32; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
          <p style="font-size: 12px; color: #888;">If you did not request this, please review your account activity immediately.</p>
        </div>
      `;
      return { subject, html, text };
    }

    default: {
      const subject = `Pawelium Notification: ${escapeHtml(template)}`;
      const text = JSON.stringify(payload, null, 2);
      const html = `<pre>${escapeHtml(text)}</pre>`;
      return { subject, html, text };
    }
  }
}
