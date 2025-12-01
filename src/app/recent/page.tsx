import { Metadata } from "next";
import RecentContent from "./recent-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lolreview.gg";

export const metadata: Metadata = {
  title: "Recent Reviews - Latest Player Ratings",
  description:
    "Browse the latest League of Legends player reviews from the community. See what players are saying about their teammates and opponents in real-time.",
  openGraph: {
    title: "Recent Reviews - Latest Player Ratings | LoLReview",
    description:
      "Browse the latest League of Legends player reviews from the community. See what players are saying about their teammates and opponents.",
    url: `${siteUrl}/recent`,
    siteName: "LoLReview",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Recent player reviews on LoLReview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Recent Reviews - Latest Player Ratings",
    description:
      "Browse the latest League of Legends player reviews from the community.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: `${siteUrl}/recent`,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Recent Reviews",
  description: "Latest League of Legends player reviews from the community",
  url: `${siteUrl}/recent`,
  isPartOf: {
    "@type": "WebSite",
    name: "LoLReview",
    url: siteUrl,
  },
};

export default function RecentPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RecentContent />
    </>
  );
}
