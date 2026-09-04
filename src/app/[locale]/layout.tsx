import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { cookies } from "next/headers";
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
      title: t("defaultTitle"),
      description: t("defaultDescription"),
      url: locale === "fr" ? siteUrl.toString() : `${siteUrl.toString()}en`,
      siteName,
      images: [
        {
          url: "/logo.jpg",
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
      locale: locale === "fr" ? "fr_FR" : "en_GB",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("defaultTitle"),
      description: t("defaultDescription"),
      images: ["/logo.jpg"],
    },
    alternates: {
      canonical: locale === "fr" ? "/" : "/en",
      languages,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#7A5C2E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

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

  const cookieStore = await cookies();
  const theme = (cookieStore.get("theme")?.value || "light") as
    | "light"
    | "dark"
    | "exotic";

  return (
    <html
      lang={locale}
      data-theme={theme}
      className={`h-full scroll-smooth antialiased ${playfair.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-bg-premium text-text-premium font-sans">
        <NextIntlClientProvider>
          <AppProvider initialTheme={theme}>
            <PWARegister />
            {children}
          </AppProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
