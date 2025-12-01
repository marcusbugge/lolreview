import { Metadata } from "next";
import PlayerContent from "./player-content";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ region?: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lolreview.gg";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const [gameName, tagLine] = decodeURIComponent(id).split("-");
  
  const title = `${gameName}#${tagLine} - Player Reviews`;
  const description = `Read community reviews and ratings for ${gameName}#${tagLine} on LoLReview. See what other players think and leave your own anonymous review.`;
  const url = `${siteUrl}/player/${id}`;

  return {
    title,
    description,
    openGraph: {
      title: `${gameName}#${tagLine} - Player Reviews | LoLReview`,
      description,
      url,
      siteName: "LoLReview",
      type: "profile",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${gameName}#${tagLine} player reviews on LoLReview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${gameName}#${tagLine} - Player Reviews`,
      description,
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// JSON-LD for individual player pages
function generatePlayerJsonLd(gameName: string, tagLine: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${gameName}#${tagLine}`,
    description: `Player reviews for ${gameName}#${tagLine} on LoLReview`,
    mainEntity: {
      "@type": "Person",
      name: gameName,
      identifier: `${gameName}#${tagLine}`,
    },
  };
}

export default async function PlayerPage({ params }: PageProps) {
  const { id } = await params;
  const [gameName, tagLine] = decodeURIComponent(id).split("-");
  const jsonLd = generatePlayerJsonLd(gameName, tagLine);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PlayerContent id={id} />
    </>
  );
}
