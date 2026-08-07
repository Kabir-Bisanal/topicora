import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Manrope, Source_Serif_4 } from "next/font/google";

import { ThemeProvider } from "@/components/layout/theme-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { publicEnv } from "@/lib/env/public";
import { absoluteUrl } from "@/lib/seo/metadata";

import "./globals.css";

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "Topicora — Useful ideas, wherever curiosity leads.",
    template: "%s | Topicora",
  },
  description:
    "An India-first publication explaining technology, money, culture, everyday life, and useful practical skills.",
  applicationName: "Topicora",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Topicora",
    title: "Topicora — Useful ideas, wherever curiosity leads.",
    description:
      "Calm, credible explanations for students, early-career professionals, and curious readers.",
    url: "/",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Topicora — Useful ideas, wherever curiosity leads.",
    description:
      "Calm, credible explanations for students, early-career professionals, and curious readers.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${serif.variable} min-h-full antialiased`}>
        <ThemeProvider>
          {children}
          <JsonLd
            data={[
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Topicora",
                url: absoluteUrl(),
                logo: absoluteUrl("/logo-mark.svg"),
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Topicora",
                url: absoluteUrl(),
                potentialAction: {
                  "@type": "SearchAction",
                  target: `${absoluteUrl("/search")}?q={search_term_string}`,
                  "query-input": "required name=search_term_string",
                },
              },
            ]}
          />
          {publicEnv.NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED ? <Analytics /> : null}
        </ThemeProvider>
      </body>
    </html>
  );
}
