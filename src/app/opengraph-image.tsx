import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "LoLReview - Rate & Review League of Legends Players";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
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
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <span
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: "#8b5cf6",
              letterSpacing: "-0.02em",
            }}
          >
            LoL
          </span>
          <span
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: "#fafafa",
              letterSpacing: "-0.02em",
            }}
          >
            Review
          </span>
        </div>

        {/* Tagline */}
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
              fontSize: 32,
              color: "#a1a1aa",
              textAlign: "center",
            }}
          >
            Rate & Review League of Legends Players
          </span>
        </div>

        {/* Poro icons */}
        <div
          style={{
            display: "flex",
            gap: 16,
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                backgroundColor: i <= 4 ? "#8b5cf6" : "#27272a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
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
              fontSize: 24,
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

