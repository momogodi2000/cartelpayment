import { prisma } from "../db/client";
import { logAudit } from "./audit";

export async function exportCustomerData(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      orders: {
        include: {
          item: true,
          payments: {
            select: {
              id: true,
              amountCents: true,
              currency: true,
              status: true,
              method: true,
              createdAt: true,
            },
          },
          delivery: true,
        },
      },
    },
  });

  if (!customer) {
    throw new Error("Customer not found.");
  }

  const tickets = await prisma.supportTicket.findMany({
    where: { customerEmail: customer.email },
    include: {
      messages: {
        where: { isInternalNote: false },
        select: { authorType: true, body: true, createdAt: true },
      },
    },
  });

  return {
    personalData: {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      country: customer.country,
      billingAddress: customer.billingAddress ? JSON.parse(customer.billingAddress) : null,
      deliveryAddress: customer.deliveryAddress ? JSON.parse(customer.deliveryAddress) : null,
      createdAt: customer.createdAt,
      anonymizedAt: customer.anonymizedAt,
    },
    orders: customer.orders,
    supportTickets: tickets,
  };
}

export class AnonymizeBlockedError extends Error {
  constructor() {
    super("ORDER_IN_PROGRESS");
    this.name = "AnonymizeBlockedError";
  }
}

/**
 * Erases a customer's personal data (GDPR). Orders and payments are kept for legal accounting.
 * Refused while an order is awaiting payment or being fulfilled. The audit trail records
 * only the customer id — never the erased email.
 */
export async function anonymizeCustomerData(customerId: string, adminId: string, ip?: string) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw new Error("Customer not found.");
  if (customer.anonymizedAt) return;

  const active = await prisma.order.count({
    where: { customerId, status: { in: ["PENDING_PAYMENT", "PAYMENT_PROCESSING", "PAID", "DOCUMENTATION_REVIEW", "PREPARING", "TRANSPORT_SCHEDULED", "IN_TRANSIT", "REFUND_PENDING", "DISPUTED"] } },
  });
  if (active > 0) throw new AnonymizeBlockedError();

  const anonymousEmail = `anonymized-${customer.id.slice(0, 8)}@gdpr.invalid`;
  await prisma.$transaction(async (tx) => {
    await tx.customer.update({
      where: { id: customerId },
      data: { name: "Anonymized", email: anonymousEmail, phone: "", billingAddress: null, deliveryAddress: null, anonymizedAt: new Date() },
    });
    await tx.supportTicket.updateMany({ where: { customerEmail: customer.email }, data: { customerEmail: anonymousEmail, name: "Anonymized" } });
    await tx.newsletterSubscriber.deleteMany({ where: { email: customer.email } });
    await logAudit({ actorType: "ADMIN", adminId, action: "GDPR_ANONYMIZE_CUSTOMER", entity: "Customer", entityId: customerId, ip }, tx);
  });
}
