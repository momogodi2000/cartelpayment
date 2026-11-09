import { NewsletterStatus } from "@prisma/client";
import { prisma } from "../db/client";
import { generateToken, hashToken } from "../security/tokens";

export async function subscribeNewsletter(email: string, locale = "en") {
  const normalizedEmail = email.toLowerCase().trim();
  const rawToken = generateToken(24);
  const confirmTokenHash = hashToken(rawToken);

  const subscriber = await prisma.newsletterSubscriber.upsert({
    where: { email: normalizedEmail },
    update: {
      locale,
      status: NewsletterStatus.CONFIRMED, // double opt-in can be confirmed or pending
    },
    create: {
      email: normalizedEmail,
      locale,
      status: NewsletterStatus.CONFIRMED,
      confirmTokenHash,
    },
  });

  return subscriber;
}

export async function confirmNewsletterSubscription(token: string) {
  const tokenHash = hashToken(token);
  const subscriber = await prisma.newsletterSubscriber.findFirst({
    where: { confirmTokenHash: tokenHash },
  });

  if (!subscriber) {
    return { success: false, error: "INVALID_OR_EXPIRED_TOKEN" };
  }

  await prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: {
      status: NewsletterStatus.CONFIRMED,
      confirmTokenHash: null,
    },
  });

  return { success: true, email: subscriber.email };
}
