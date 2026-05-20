import { z } from "zod";

export const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Phone number must be at least 6 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  message: z.string().optional().default(""),
  preferredContact: z.enum(["EMAIL", "WHATSAPP", "PHONE"]),
  parrotIds: z.array(z.string()).min(1, "Please add at least one bird to your inquiry"),
});

type CheckoutParrotSummary = {
  name: string;
  species: string;
};

export function generateWhatsAppText(
  data: z.infer<typeof checkoutSchema>,
  parrots: CheckoutParrotSummary[]
) {
  const intro = data.preferredContact === "WHATSAPP"
    ? `Hello AraHaven! My name is ${data.name} from ${data.country}. I just submitted a reservation inquiry on your website and would like to proceed via WhatsApp.`
    : `Hello AraHaven! My name is ${data.name} from ${data.country}. I submitted a reservation inquiry (Preferred Contact: ${data.preferredContact}).`;

  const birds = parrots.map((p) => `- ${p.name} (${p.species})`).join("\n");
  const msgText = data.message ? `\nMy message:\n"${data.message}"` : "";

  return `${intro}\n\nSelected Birds:\n${birds}${msgText}\n\nEmail: ${data.email}\nPhone: ${data.phone}`;
}
