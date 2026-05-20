export function getWhatsAppLink(phone: string, text: string): string {
  // Strip any characters like +, -, spaces, etc., except numbers, to ensure valid URL
  const cleanPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
