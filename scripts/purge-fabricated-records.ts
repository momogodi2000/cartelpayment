/**
 * scripts/purge-fabricated-records.ts
 *
 * Removes records fabricated by earlier seed versions (demo/"companion" animals, invented
 * breeders, sample customers, orders, fake payments, reviews and tickets). Real listings
 * are kept; any real animal linked to an invented breeder is unlinked.
 *
 * Dry run by default. Apply with:  npx tsx scripts/purge-fabricated-records.ts --apply
 * Production (Neon) additionally requires PURGE_ALLOW_PRODUCTION=1 — ask before running.
 */
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const FABRICATED = {
  animalSlugs: [
    "companion-barnaby", "companion-cosmo", "companion-daphne", "companion-elio",
    "demo-animal-sold", "demo-animal-held", "demo-animal-unavailable", "demo-animal-archived",
  ],
  breederSlugs: ["domaine-des-hauts-coteaux", "cattery-des-etoiles"],
  customerIds: ["cust-claire-dupont", "cust-arthur-pendelton", "demo-customer-1", "demo-customer-2"],
  orderRefs: ["PW-FR829104", "PW-BE447812", "PW-DEMOHELD01", "PW-DEMOSOLD01"],
  paymentRefs: ["cs_held_order_session_01", "cs_live_settled_order_01", "MTX-DEMO-HELD-001", "MTX-DEMO-SOLD-001"],
  ticketRefs: ["TK-PAW-0001", "TK-DEMO0001"],
  reviewIds: ["rev-eleonore-b", "rev-marcus-v", "demo-review-1", "demo-review-2"],
};

async function main() {
  const isProd = (process.env.DATABASE_PROVIDER || "sqlite") === "postgresql";
  if (APPLY && isProd && process.env.PURGE_ALLOW_PRODUCTION !== "1") {
    throw new Error("Refusing to purge PostgreSQL without PURGE_ALLOW_PRODUCTION=1 (explicit authorisation required).");
  }

  const animals = await prisma.animal.findMany({
    where: { OR: [{ slug: { in: FABRICATED.animalSlugs } }, { isDemo: true }], isPaymentTest: false },
    select: { id: true, slug: true },
  });
  const breeders = await prisma.breeder.findMany({
    where: { OR: [{ slug: { in: FABRICATED.breederSlugs } }, { isDemo: true }] },
    select: { id: true, slug: true },
  });
  const customers = await prisma.customer.findMany({ where: { id: { in: FABRICATED.customerIds } }, select: { id: true, email: true } });
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { reference: { in: FABRICATED.orderRefs } },
        { customerId: { in: customers.map((c) => c.id) } },
        { item: { animalId: { in: animals.map((a) => a.id) } } },
      ],
    },
    select: { id: true, reference: true },
  });
  const payments = await prisma.payment.findMany({
    where: { OR: [{ providerReference: { in: FABRICATED.paymentRefs } }, { isSeedDemo: true }, { orderId: { in: orders.map((o) => o.id) } }] },
    select: { id: true, providerReference: true },
  });
  const tickets = await prisma.supportTicket.findMany({
    where: { OR: [{ reference: { in: FABRICATED.ticketRefs } }, { orderId: { in: orders.map((o) => o.id) } }] },
    select: { id: true, reference: true },
  });
  const reviews = await prisma.review.findMany({
    where: { OR: [{ id: { in: FABRICATED.reviewIds } }, { isDemo: true }, { animalId: { in: animals.map((a) => a.id) } }] },
    select: { id: true },
  });
  const linkedReal = await prisma.animal.findMany({
    where: { breederId: { in: breeders.map((b) => b.id) }, id: { notIn: animals.map((a) => a.id) } },
    select: { slug: true },
  });

  const plan = {
    animals: animals.map((a) => a.slug),
    breeders: breeders.map((b) => b.slug),
    customers: customers.map((c) => c.email),
    orders: orders.map((o) => o.reference),
    payments: payments.map((p) => p.providerReference || p.id),
    tickets: tickets.map((t) => t.reference),
    reviews: reviews.length,
    realAnimalsToUnlinkFromInventedBreeders: linkedReal.map((a) => a.slug),
  };
  console.log(APPLY ? "APPLYING purge:" : "DRY RUN (use --apply to execute):");
  console.log(JSON.stringify(plan, null, 2));
  if (!APPLY) return;

  const orderIds = orders.map((o) => o.id);
  const paymentIds = payments.map((p) => p.id);
  const ticketIds = tickets.map((t) => t.id);
  const animalIds = animals.map((a) => a.id);

  await prisma.$transaction([
    prisma.ticketAttachment.deleteMany({ where: { message: { ticketId: { in: ticketIds } } } }),
    prisma.ticketMessage.deleteMany({ where: { ticketId: { in: ticketIds } } }),
    prisma.supportTicket.deleteMany({ where: { id: { in: ticketIds } } }),
    prisma.review.deleteMany({ where: { id: { in: reviews.map((r) => r.id) } } }),
    prisma.paymentEvent.deleteMany({ where: { paymentId: { in: paymentIds } } }),
    prisma.refund.deleteMany({ where: { paymentId: { in: paymentIds } } }),
    prisma.reconciliationException.deleteMany({ where: { OR: [{ paymentId: { in: paymentIds } }, { orderId: { in: orderIds } }] } }),
    prisma.paymentAttempt.deleteMany({ where: { paymentId: { in: paymentIds } } }),
    prisma.payment.deleteMany({ where: { id: { in: paymentIds } } }),
    prisma.delivery.deleteMany({ where: { orderId: { in: orderIds } } }),
    prisma.orderStatusHistory.deleteMany({ where: { orderId: { in: orderIds } } }),
    prisma.reservation.deleteMany({ where: { OR: [{ orderId: { in: orderIds } }, { animalId: { in: animalIds } }] } }),
    prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } }),
    prisma.order.deleteMany({ where: { id: { in: orderIds } } }),
    prisma.customer.deleteMany({ where: { id: { in: customers.map((c) => c.id) }, orders: { none: {} } } }),
    prisma.animalImage.deleteMany({ where: { animalId: { in: animalIds } } }),
    prisma.animalDocument.deleteMany({ where: { animalId: { in: animalIds } } }),
    prisma.animal.deleteMany({ where: { id: { in: animalIds } } }),
    prisma.animal.updateMany({ where: { breederId: { in: breeders.map((b) => b.id) } }, data: { breederId: null } }),
    prisma.breeder.deleteMany({ where: { id: { in: breeders.map((b) => b.id) } } }),
  ]);
  console.log("Purge complete.");
}

main()
  .catch((e) => {
    console.error(e.message || e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
