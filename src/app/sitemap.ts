import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lolreview.gg";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/recent`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/trending`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];

  // You can dynamically fetch player pages from your database here
  // Example: Fetch top players to include in sitemap
  let playerPages: MetadataRoute.Sitemap = [];

  try {
    // Fetch trending players to include in sitemap
    const response = await fetch(`${siteUrl}/api/stats/trending`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (response.ok) {
      const players = await response.json();
      playerPages = players.map(
        (player: {
          game_name: string;
          tag_line: string;
          last_searched?: string;
        }) => ({
          url: `${siteUrl}/player/${encodeURIComponent(
            player.game_name
          )}-${encodeURIComponent(player.tag_line)}`,
          lastModified: player.last_searched
            ? new Date(player.last_searched)
            : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        })
      );
    }
  } catch (error) {
    console.error("Error fetching players for sitemap:", error);
  }

  return [...staticPages, ...playerPages];
}
