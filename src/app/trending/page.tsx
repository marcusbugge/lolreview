import { Metadata } from "next";
import TrendingContent from "./trending-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lolreview.gg";

export const metadata: Metadata = {
  title: "Trending Players - Most Searched Summoners",
  description:
    "Discover the most searched League of Legends players on LoLReview. See which summoners are trending and read their community reviews.",
  openGraph: {
    title: "Trending Players - Most Searched Summoners | LoLReview",
    description:
      "Discover the most searched League of Legends players on LoLReview. See which summoners are trending and read their community reviews.",
    url: `${siteUrl}/trending`,
    siteName: "LoLReview",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Trending players on LoLReview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trending Players - Most Searched Summoners",
    description:
      "Discover the most searched League of Legends players on LoLReview.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: `${siteUrl}/trending`,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Trending Players",
  description: "Most searched League of Legends players on LoLReview",
  url: `${siteUrl}/trending`,
  isPartOf: {
    "@type": "WebSite",
    name: "LoLReview",
    url: siteUrl,
  },
};

export default function TrendingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrendingContent />
    </>
  );
}
