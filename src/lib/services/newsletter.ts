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
