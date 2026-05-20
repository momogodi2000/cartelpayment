import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import PWARegister from "@/components/common/PWARegister";
import ProductDetailModal from "@/components/common/ProductDetailModal";
import { AppProvider } from "@/context/AppContext";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: {
    default: "AraHaven Aviary | Premium Exotic Parrots & Hand-Tamed Macaws",
    template: "%s | AraHaven Aviary",
  },
  description: "Certified exotic bird breeder specializing in ethically raised, hand-tamed, and legally documented macaws, cockatoos, and amazon parrots in Latin America.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AraHaven",
  },
  keywords: ["exotic birds", "parrots for sale", "hand-tamed macaw", "cockatoo breeder", "cites certified breeder"],
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A6B3C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

import { cookies } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = (cookieStore.get("theme")?.value || "light") as "light" | "dark" | "exotic";
  const locale = (cookieStore.get("locale")?.value || "en") as "en" | "fr";

  return (
    <html lang={locale} data-theme={theme} className={`h-full scroll-smooth antialiased ${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-bg-premium text-text-premium font-sans">
        <AppProvider initialTheme={theme} initialLanguage={locale}>
          <CartProvider>
            {/* Client-side PWA service worker registration */}
            <PWARegister />

            {/* Global sticky header */}
            <Header />

            {/* Dynamic page content */}
            <main className="flex-grow">{children}</main>

            {/* Footer containing credentials & links */}
            <Footer />

            {/* Floating WhatsApp contact widget */}
            <WhatsAppButton />

            {/* Global product detail modal overlay */}
            <ProductDetailModal />
          </CartProvider>
        </AppProvider>
      </body>
    </html>
  );
}
