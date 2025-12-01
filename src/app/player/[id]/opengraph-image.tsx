import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Player Reviews - LoLReview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: { id: string } }) {
  const [gameName, tagLine] = decodeURIComponent(params.id).split("-");

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          backgroundImage:
            "radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
        }}
      >
        {/* Small logo at top */}
        <div
          style={{
            position: "absolute",
            top: 40,
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#8b5cf6",
            }}
          >
            LoL
          </span>
          <span
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#fafafa",
            }}
          >
            Review
          </span>
        </div>

        {/* Player name */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#fafafa",
              letterSpacing: "-0.02em",
            }}
          >
            {gameName}
          </span>
          <span
            style={{
              fontSize: 48,
              fontWeight: 600,
              color: "#71717a",
              marginLeft: 8,
            }}
          >
            #{tagLine}
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 50,
          }}
        >
          <span
            style={{
              fontSize: 28,
              color: "#a1a1aa",
              textAlign: "center",
            }}
          >
            View player reviews and ratings
          </span>
        </div>

        {/* Rating stars placeholder */}
        <div
          style={{
            display: "flex",
            gap: 12,
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "#27272a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              ⭐
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 22,
              color: "#71717a",
            }}
          >
            lolreview.gg
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

