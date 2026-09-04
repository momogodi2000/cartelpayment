import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import PWARegister from "@/components/common/PWARegister";
import { AppProvider } from "@/context/AppContext";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/data/site";

const siteUrl = new URL(siteConfig.siteUrl || "http://localhost:3000");
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || siteConfig.name;
// Google Search Console. Primary verification is the /google8ba7d4ac32edda16.html
// file in /public; set this to the "HTML tag" token to also verify via <meta>.
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

// Headings are set in `font-black` — load the weights actually used and no more.
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["700", "800", "900"],
  display: "swap",
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });

  const languages: Record<string, string> = {
    "fr-FR": "/",
    "en-GB": "/en",
    "x-default": "/",
  };

  return {
    metadataBase: siteUrl,
    applicationName: siteName,
    title: {
      default: t("defaultTitle"),
      template: `%s | ${siteName}`,
    },
    description: t("defaultDescription"),
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: siteName,
    },
    keywords: t("keywords").split(",").map((k) => k.trim()),
    authors: [{ name: siteName }],
    icons: {
      icon: [{ url: "/logo.jpg", type: "image/jpeg" }],
      shortcut: "/logo.jpg",
      apple: "/logo.jpg",
    },
    openGraph: {
      // Card image comes from src/app/opengraph-image.tsx (per-listing pages override it).
      title: t("defaultTitle"),
      description: t("defaultDescription"),
      url: locale === "fr" ? siteUrl.toString() : `${siteUrl.toString()}en`,
      siteName,
      locale: locale === "fr" ? "fr_FR" : "en_GB",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("defaultTitle"),
      description: t("defaultDescription"),
    },
    alternates: {
      canonical: locale === "fr" ? "/" : "/en",
      languages,
    },
    ...(googleSiteVerification
      ? { verification: { google: googleSiteVerification } }
      : {}),
  };
}

export const viewport: Viewport = {
  themeColor: "#7A5C2E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Runs before first paint so the theme is applied without a flash and without
// reading cookies on the server (which would force every route to render dynamically).
const themeInit = `(function(){try{var t=localStorage.getItem('pawelium_theme');if(t!=='light'&&t!=='dark'&&t!=='exotic'){var m=document.cookie.match(/(?:^|;\\s*)theme=(light|dark|exotic)/);t=m?m[1]:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`h-full scroll-smooth antialiased ${playfair.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-bg-premium text-text-premium font-sans">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <NextIntlClientProvider>
          <AppProvider>
            <PWARegister />
            {children}
          </AppProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
