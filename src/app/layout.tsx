import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import PWARegister from "@/components/common/PWARegister";
import { AppProvider } from "@/context/AppContext";

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "CaniPrestige";

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
    default: `${siteName} — Chiens & Chiots de Race | Sélection Européenne`,
    template: `%s | ${siteName}`,
  },
  description:
    "CaniPrestige sélectionne les meilleurs chiens et chiots de race pour vous accompagner. Découvrez nos profils détaillés, contactez-nous via WhatsApp. Sélection européenne responsable.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CaniPrestige",
  },
  keywords: [
    "chiens de race europe",
    "chiots de race",
    "chiots disponibles france",
    "golden retriever chiot",
    "labrador chiot",
    "berger allemand chiot",
    "élevage canin responsable",
    "chiot pedigree europe",
    "dogs puppies europe",
    "purebred dogs",
  ],
  icons: {
    icon: [{ url: "/logo.jpg", type: "image/jpeg" }],
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: {
      template: "%s | CaniPrestige",
      default: "CaniPrestige | L'excellence canine européenne",
    },
    description:
      "CaniPrestige sélectionne les meilleurs chiots de race auprès d'éleveurs européens certifiés.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://caniprestige.eu",
    siteName: "CaniPrestige",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "CaniPrestige - Chiots d'exception",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CaniPrestige | Chiots d'exception",
    description:
      "Découvrez notre sélection de chiots européens avec pedigree, carnet de santé à jour et garanties complètes.",
    images: ["/logo.jpg"],
  },
  alternates: {
    canonical: siteUrl.toString(),
    languages: {
      "fr": `${siteUrl.toString()}`,
      "en": `${siteUrl.toString()}`,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#7A5C2E",
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
  const locale = (cookieStore.get("locale")?.value || "fr") as "en" | "fr";

  return (
    <html
      lang={locale}
      data-theme={theme}
      className={`h-full scroll-smooth antialiased ${playfair.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-bg-premium text-text-premium font-sans">
        <AppProvider initialTheme={theme} initialLanguage={locale}>
          <PWARegister />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
