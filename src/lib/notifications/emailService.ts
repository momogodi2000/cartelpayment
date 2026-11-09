// Pawelium 2.0 — Transactional Email Notification System
// Supports Resend API or SMTP, logs all notifications, and provides responsive luxury HTML templates

import { siteConfig } from '@/data/site';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export class EmailNotificationService {
  /**
   * Dispatches an email via Resend or logs securely
   */
  static async sendEmail(payload: EmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.EMAIL_FROM || 'Pawelium European Concierge <contact@pawelium.fyi>';

    // If Resend API key is provided, dispatch via Resend REST API
    if (resendApiKey && !resendApiKey.startsWith('re_placeholder')) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: payload.to,
            subject: payload.subject,
            html: payload.html,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return { success: true, id: data.id };
        } else {
          const errText = await response.text();
          console.warn('Resend API response warning:', errText);
          return { success: false, error: errText };
        }
      } catch (err) {
        console.error('Error dispatching via Resend:', err);
        return { success: false, error: String(err) };
      }
    }

    // Development / Logging mode: log cleanly to console & memory
    console.log(`[PAWELIUM EMAIL DISPATCH] To: ${payload.to} | Subject: "${payload.subject}"`);
    return { success: true, id: `log_${Date.now()}` };
  }

  /**
   * Template: Order Confirmation & Payment Instructions
   */
  static async sendOrderConfirmation(order: {
    orderReference: string;
    customerName: string;
    customerEmail: string;
    totalCents: number;
    animalName: string;
    animalBreed: string;
    trackingToken: string;
    checkoutUrl?: string;
  }): Promise<void> {
    const formattedPrice = `€${(order.totalCents / 100).toFixed(2)}`;
    const trackingUrl = `${siteConfig.siteUrl}/en/track-order?ref=${encodeURIComponent(order.orderReference)}`;

    const html = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F8F6F0; padding: 40px; border: 1px solid #E5E1D8; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #183C32; font-size: 28px; margin: 0; letter-spacing: 2px;">PAWELIUM</h1>
          <p style="color: #B69A65; font-size: 13px; text-transform: uppercase; margin-top: 4px; letter-spacing: 1.5px;">European Pet Marketplace & Concierge</p>
        </div>
        <div style="background: #FFFFFF; padding: 30px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <h2 style="color: #202823; font-size: 20px; margin-top: 0;">Order Acknowledgment: ${order.orderReference}</h2>
          <p style="color: #4A5568; line-height: 1.6;">Dear ${order.customerName},</p>
          <p style="color: #4A5568; line-height: 1.6;">Your order for <strong>${order.animalName} (${order.animalBreed})</strong> has been received and registered under reference <strong>${order.orderReference}</strong>.</p>
          
          <div style="background: #F8F6F0; padding: 18px; border-radius: 6px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0; color: #202823;"><strong>Total Amount:</strong> ${formattedPrice} EUR</p>
            <p style="margin: 0; color: #202823;"><strong>Inventory Hold:</strong> Active (15 minutes during checkout)</p>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${trackingUrl}" style="background: #183C32; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 4px; font-weight: bold; display: inline-block;">Track Your Order</a>
          </div>

          <p style="color: #718096; font-size: 13px; line-height: 1.5;">You do not need a password or permanent account. Track your progress anytime with your order reference and email address.</p>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #A0AEC0; font-size: 12px;">
          © ${new Date().getFullYear()} Pawelium Europe. Dedicated to ethical breeding and animal welfare.
        </div>
      </div>
    `;

    await this.sendEmail({
      to: order.customerEmail,
      subject: `Order Confirmation: ${order.orderReference} — ${order.animalName}`,
      html,
    });
  }

  /**
   * Template: Payment Verified & Purchase Confirmed
   */
  static async sendPaymentSuccess(order: {
    orderReference: string;
    customerName: string;
    customerEmail: string;
    totalCents: number;
    animalName: string;
    animalBreed: string;
  }): Promise<void> {
    const formattedPrice = `€${(order.totalCents / 100).toFixed(2)}`;
    const trackingUrl = `${siteConfig.siteUrl}/en/track-order?ref=${encodeURIComponent(order.orderReference)}`;

    const html = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F8F6F0; padding: 40px; border: 1px solid #E5E1D8; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #183C32; font-size: 28px; margin: 0; letter-spacing: 2px;">PAWELIUM</h1>
          <p style="color: #B69A65; font-size: 13px; text-transform: uppercase; margin-top: 4px; letter-spacing: 1.5px;">Payment Verified</p>
        </div>
        <div style="background: #FFFFFF; padding: 30px; border-radius: 6px;">
          <div style="display: inline-block; background: #E6F4EA; color: #137333; font-size: 13px; font-weight: bold; padding: 4px 12px; border-radius: 12px; margin-bottom: 16px;">
            100% Full Payment Received
          </div>
          <h2 style="color: #202823; font-size: 22px; margin-top: 0;">Congratulations, ${order.customerName}!</h2>
          <p style="color: #4A5568; line-height: 1.6;">Your bank card payment of <strong>${formattedPrice} EUR</strong> has been successfully processed with 3D-Secure protection. <strong>${order.animalName}</strong> has been officially confirmed as your purchase and permanently marked as <strong>SOLD</strong> in our registry.</p>

          <h3 style="color: #183C32; font-size: 16px; margin-top: 24px;">Next Steps in the Pawelium Concierge Journey:</h3>
          <ol style="color: #4A5568; line-height: 1.7; padding-left: 20px;">
            <li><strong>Veterinary Documentation Audit:</strong> Final health check and European passport endorsement.</li>
            <li><strong>Breeder Coordination:</strong> Preparation of dietary guidelines and transition package.</li>
            <li><strong>Dedicated Pet Transport:</strong> Scheduling door-to-door climate-controlled European delivery.</li>
          </ol>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${trackingUrl}" style="background: #183C32; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 4px; font-weight: bold; display: inline-block;">Access Order Tracking Portal</a>
          </div>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: order.customerEmail,
      subject: `Payment Confirmed: ${order.orderReference} — ${order.animalName} is yours!`,
      html,
    });
  }

  /**
   * Template: 6-Digit OTP Code for Guest Order Tracking
   */
  static async sendTrackingOtp(email: string, orderReference: string, otpCode: string): Promise<void> {
    const html = `
      <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; background: #F8F6F0; padding: 35px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #183C32; font-size: 24px; margin: 0;">PAWELIUM</h1>
          <p style="color: #B69A65; font-size: 12px; text-transform: uppercase;">Secure Order Tracking Access</p>
        </div>
        <div style="background: #FFFFFF; padding: 25px; border-radius: 6px; text-align: center;">
          <p style="color: #4A5568; margin-bottom: 20px;">Enter the following single-use verification code to view order <strong>${orderReference}</strong>:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #183C32; background: #F8F6F0; padding: 16px; border-radius: 6px; display: inline-block;">
            ${otpCode}
          </div>
          <p style="color: #718096; font-size: 13px; margin-top: 20px;">This code is valid for 15 minutes. For your security, never share this code with anyone.</p>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: `Your Pawelium Tracking Code: ${otpCode} (Order ${orderReference})`,
      html,
    });
  }

  /**
   * Template: Support Ticket Created or Replied
   */
  static async sendTicketNotification(ticket: {
    ticketReference: string;
    customerEmail: string;
    customerName: string;
    subject: string;
    messageText: string;
    sender: 'ADMIN' | 'CUSTOMER';
  }): Promise<void> {
    const isFromAdmin = ticket.sender === 'ADMIN';
    const trackingUrl = `${siteConfig.siteUrl}/en/support/ticket?ref=${ticket.ticketReference}`;

    const html = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F8F6F0; padding: 35px; border-radius: 8px;">
        <h2 style="color: #183C32; margin-top: 0;">Support Ticket ${ticket.ticketReference}</h2>
        <p style="color: #4A5568;">Subject: <strong>${ticket.subject}</strong></p>
        <div style="background: #FFFFFF; padding: 20px; border-left: 4px solid #183C32; border-radius: 4px; margin: 20px 0;">
          <p style="color: #2D3748; white-space: pre-wrap; margin: 0;">${ticket.messageText}</p>
        </div>
        <div style="text-align: center; margin-top: 25px;">
          <a href="${trackingUrl}" style="background: #183C32; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View Full Conversation</a>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: ticket.customerEmail,
      subject: isFromAdmin
        ? `[Pawelium Concierge] Response to Ticket ${ticket.ticketReference}`
        : `Support Ticket Received: ${ticket.ticketReference}`,
      html,
    });
  }
}
