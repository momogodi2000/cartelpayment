import crypto from "node:crypto";
import { TicketCategory, TicketPriority, TicketStatus, MessageAuthorType, GuestScope } from "@prisma/client";
import { prisma } from "../db/client";
import { getEnv } from "../env";
import { generateTicketReference } from "../domain/references";
import { generateToken, hashToken } from "../security/tokens";
import { queueEmail, sendEmailNotification } from "./email/outbox";

export interface CreateSupportTicketInput {
  name: string;
  email: string;
  orderRef?: string;
  category: TicketCategory;
  subject: string;
  message: string;
  locale?: string;
}

export interface CreateTicketResult {
  ticketRef: string;
  accessToken: string;
}

/**
 * Creates a new support ticket and sends an access link to the customer.
 */
export async function createSupportTicket(input: CreateSupportTicketInput): Promise<CreateTicketResult> {
  const reference = generateTicketReference();
  const rawAccessToken = generateToken(32);
  const accessTokenHash = hashToken(rawAccessToken);
  const locale = input.locale || "en";

  let orderId: string | null = null;
  if (input.orderRef) {
    const order = await prisma.order.findUnique({
      where: { reference: input.orderRef.trim().toUpperCase() },
    });
    if (order) orderId = order.id;
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      reference,
      orderId,
      customerEmail: input.email.toLowerCase().trim(),
      name: input.name.trim(),
      category: input.category,
      subject: input.subject.trim(),
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.OPEN,
      accessTokenHash,
    },
  });

  await prisma.ticketMessage.create({
    data: {
      ticketId: ticket.id,
      authorType: MessageAuthorType.CUSTOMER,
      isInternalNote: false,
      body: input.message.trim(),
    },
  });

  const siteUrl = getEnv().NEXT_PUBLIC_SITE_URL;
  const ticketUrl = `${siteUrl}/${locale}/support/ticket/${rawAccessToken}`;

  const notifId = await queueEmail({
    idempotencyKey: `ticket:${ticket.id}:created`,
    template: "support_ticket_created",
    locale,
    toEmail: input.email,
    payload: {
      ticketRef: reference,
      ticketUrl,
    },
  });

  sendEmailNotification(notifId).catch(console.error);

  return { ticketRef: reference, accessToken: rawAccessToken };
}

/**
 * Resolves a ticket for a customer via access token.
 * NEVER selects internal notes!
 */
export async function getTicketForCustomer(accessToken: string) {
  const tokenHash = hashToken(accessToken);
  const ticket = await prisma.supportTicket.findUnique({
    where: { accessTokenHash: tokenHash },
    include: {
      messages: {
        where: { isInternalNote: false }, // Strict isolation: internal notes never returned to customer
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return ticket;
}

/**
 * Customer appends a reply to their ticket thread.
 */
export async function replyTicketCustomer(accessToken: string, body: string) {
  const tokenHash = hashToken(accessToken);
  const ticket = await prisma.supportTicket.findUnique({
    where: { accessTokenHash: tokenHash },
  });

  if (!ticket) {
    throw new Error("Invalid ticket access token.");
  }

  const message = await prisma.ticketMessage.create({
    data: {
      ticketId: ticket.id,
      authorType: MessageAuthorType.CUSTOMER,
      isInternalNote: false,
      body: body.trim(),
    },
  });

  // Re-open ticket if it was resolved
  if (ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED) {
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { status: TicketStatus.IN_PROGRESS },
    });
  }

  return message;
}

/**
 * Admin view of ticket (includes internal notes and admin operations).
 */
export async function getTicketForAdmin(ticketId: string) {
  return await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      order: {
        include: {
          customer: true,
          item: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          admin: {
            select: { name: true, email: true },
          },
        },
      },
    },
  });
}

/**
 * Admin posts a reply or an internal note.
 */
export async function adminReplyTicket(
  ticketId: string,
  adminId: string,
  body: string,
  isInternalNote: boolean
) {
  const message = await prisma.ticketMessage.create({
    data: {
      ticketId,
      authorType: MessageAuthorType.ADMIN,
      adminId,
      isInternalNote,
      body: body.trim(),
    },
  });

  if (!isInternalNote) {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: TicketStatus.WAITING_CUSTOMER },
    });
  }

  return message;
}
