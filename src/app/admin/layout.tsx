import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "../globals.css";
import { resolveAdminLocale } from "@/i18n/locale";

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

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#183C32",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Pawelium Super Admin Portal",
  robots: {
    index: false,
    follow: false,
  },
};

const themeInit = `(function(){try{var t=localStorage.getItem('pawelium_theme');if(t!=='light'&&t!=='dark'&&t!=='exotic'){var m=document.cookie.match(/(?:^|;\\s*)theme=(light|dark|exotic)/);t=m?m[1]:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');}document.documentElement.setAttribute('data-theme',t);if(t==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`;

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminLocale = await resolveAdminLocale();

  return (
    <html
      lang={adminLocale}
      className={`h-full antialiased ${playfair.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-[#B69A65]/30">
        {children}
      </body>
    </html>
  );
}
