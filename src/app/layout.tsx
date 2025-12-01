import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Lora, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lolreview.gg";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LoLReview - Rate & Review League of Legends Players",
    template: "%s | LoLReview",
  },
  description:
    "The community-driven platform to anonymously rate and review League of Legends players. Search any summoner by Riot ID and share your experience with the LoL community.",
  keywords: [
    "League of Legends",
    "LoL",
    "player reviews",
    "summoner ratings",
    "Riot Games",
    "player reputation",
    "LoL community",
    "rate players",
    "toxic players",
    "good teammates",
    "ranked reviews",
    "EUW",
    "NA",
    "EUNE",
    "Korea",
  ],
  authors: [{ name: "LoLReview" }],
  creator: "LoLReview",
  publisher: "LoLReview",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "LoLReview",
    title: "LoLReview - Rate & Review League of Legends Players",
    description:
      "The community-driven platform to anonymously rate and review League of Legends players. Search any summoner and share your experience.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LoLReview - Rate League of Legends Players",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LoLReview - Rate & Review League of Legends Players",
    description:
      "The community-driven platform to anonymously rate and review League of Legends players.",
    images: ["/og-image.png"],
    creator: "@lolreview",
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "gaming",
  classification: "Gaming Community Tool",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  other: {
    "google-site-verification": "YOUR_GOOGLE_VERIFICATION_CODE",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// JSON-LD Structured Data for the website
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "LoLReview",
  description:
    "The community-driven platform to anonymously rate and review League of Legends players",
  url: siteUrl,
  applicationCategory: "GameApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.5",
    ratingCount: "1000",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${plusJakarta.variable} ${lora.variable} ${ibmPlexMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
