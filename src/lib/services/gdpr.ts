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

export async function anonymizeCustomerData(customerId: string, adminId: string, ip?: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) {
    throw new Error("Customer not found.");
  }

  const anonymousEmail = `anonymized-${customer.id.slice(0, 8)}@gdpr.pawelium.local`;

  await prisma.$transaction(async (tx) => {
    await tx.customer.update({
      where: { id: customerId },
      data: {
        name: "Anonymized User",
        email: anonymousEmail,
        phone: "+33000000000",
        billingAddress: null,
        deliveryAddress: null,
        anonymizedAt: new Date(),
      },
    });

    await logAudit(
      {
        actorType: "ADMIN",
        adminId,
        action: "GDPR_ANONYMIZE_CUSTOMER",
        entity: "Customer",
        entityId: customerId,
        ip,
        diff: { originalEmail: customer.email, anonymizedEmail: anonymousEmail },
      },
      tx
    );
  });
}
