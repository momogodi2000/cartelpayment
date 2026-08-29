import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import PWARegister from "@/components/common/PWARegister";
import { AppProvider } from "@/context/AppContext";

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "PawElite";

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
    "PawElite sélectionne les meilleurs chiens et chiots de race pour vous accompagner. Découvrez nos profils détaillés, contactez-nous via WhatsApp. Sélection européenne responsable.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PawElite",
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
    icon: [{ url: "/logo.png", type: "image/png" }],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName,
    title: `${siteName} — Chiens & Chiots de Race Premium`,
    description:
      "Découvrez des chiens et chiots de race sélectionnés avec soin, issus d'élevages responsables en Europe. Transparence, bien-être et passion canine.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: `${siteName} — Sélection Canine Européenne`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Chiens & Chiots de Race`,
    description:
      "Sélection premium de chiens et chiots de race en Europe. Contact direct via WhatsApp.",
    images: ["/logo.png"],
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
