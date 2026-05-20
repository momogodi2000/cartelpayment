import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import PWARegister from "@/components/common/PWARegister";
import { AppProvider } from "@/context/AppContext";
import { CartProvider } from "@/context/CartContext";

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "AraHaven Aviary";
const appLogo = "/logo.png";

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

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: siteName,
  title: {
    default: `${siteName} | Premium Exotic Parrots & Hand-Tamed Macaws`,
    template: `%s | ${siteName}`,
  },
  description:
    "Certified exotic bird breeder specializing in ethically raised, hand-tamed, and legally documented macaws, cockatoos, and amazon parrots in Latin America.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AraHaven",
  },
  keywords: [
    "exotic birds",
    "parrots for sale",
    "hand-tamed macaw",
    "cockatoo breeder",
    "cites certified breeder",
  ],
  icons: {
    icon: [{ url: appLogo, type: "image/png" }],
    shortcut: appLogo,
    apple: appLogo,
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName,
    title: `${siteName} | Premium Exotic Parrots`,
    description:
      "Explore legally documented, hand-tamed exotic parrots from a professional premium aviary.",
    images: [
      {
        url: appLogo,
        width: 512,
        height: 512,
        alt: `${siteName} logo`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `${siteName} | Premium Exotic Parrots`,
    description:
      "Explore legally documented, hand-tamed exotic parrots from a professional premium aviary.",
    images: [appLogo],
  },
};

export const viewport: Viewport = {
  themeColor: "#1A6B3C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = (cookieStore.get("theme")?.value || "light") as
    | "light"
    | "dark"
    | "exotic";
  const locale = (cookieStore.get("locale")?.value || "en") as "en" | "fr";

  return (
    <html
      lang={locale}
      data-theme={theme}
      className={`h-full scroll-smooth antialiased ${playfair.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-bg-premium text-text-premium font-sans">
        <AppProvider initialTheme={theme} initialLanguage={locale}>
          <CartProvider>
            <PWARegister />
            {children}
          </CartProvider>
        </AppProvider>
      </body>
    </html>
  );
}
