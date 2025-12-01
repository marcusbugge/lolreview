"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface PoroRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function PoroRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: PoroRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const sizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  // Use span for readonly to avoid nested button issues
  const Wrapper = readonly ? "span" : "button";

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((rating) => {
        const isActive = rating <= (hoverValue || value);
        return (
          <Wrapper
            key={rating}
            {...(!readonly && { type: "button" as const })}
            onClick={() => handleClick(rating)}
            onMouseEnter={() => !readonly && setHoverValue(rating)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
            className={cn(
              "transition-all duration-150",
              !readonly && "cursor-pointer hover:scale-110",
              readonly && "cursor-default"
            )}
          >
            <svg
              viewBox="0 0 100 100"
              className={cn(
                sizes[size],
                "transition-all duration-150",
                isActive
                  ? "drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                  : "opacity-30"
              )}
            >
              {/* Poro body */}
              <ellipse
                cx="50"
                cy="55"
                rx="35"
                ry="30"
                className={cn(
                  "transition-colors duration-150",
                  isActive ? "fill-primary" : "fill-muted-foreground/40"
                )}
              />
              {/* Left ear */}
              <ellipse
                cx="25"
                cy="30"
                rx="10"
                ry="15"
                className={cn(
                  "transition-colors duration-150",
                  isActive ? "fill-primary" : "fill-muted-foreground/40"
                )}
              />
              {/* Right ear */}
              <ellipse
                cx="75"
                cy="30"
                rx="10"
                ry="15"
                className={cn(
                  "transition-colors duration-150",
                  isActive ? "fill-primary" : "fill-muted-foreground/40"
                )}
              />
              {/* Left eye */}
              <circle cx="38" cy="50" r="5" className="fill-background" />
              <circle cx="39" cy="49" r="2" className="fill-foreground" />
              {/* Right eye */}
              <circle cx="62" cy="50" r="5" className="fill-background" />
              <circle cx="63" cy="49" r="2" className="fill-foreground" />
              {/* Nose */}
              <ellipse
                cx="50"
                cy="60"
                rx="4"
                ry="3"
                className="fill-pink-400"
              />
              {/* Tongue */}
              <ellipse
                cx="50"
                cy="70"
                rx="6"
                ry="4"
                className="fill-pink-300"
              />
              {/* Whiskers */}
              <line
                x1="20"
                y1="55"
                x2="35"
                y2="58"
                className="stroke-foreground/30"
                strokeWidth="1"
              />
              <line
                x1="20"
                y1="60"
                x2="35"
                y2="60"
                className="stroke-foreground/30"
                strokeWidth="1"
              />
              <line
                x1="80"
                y1="55"
                x2="65"
                y2="58"
                className="stroke-foreground/30"
                strokeWidth="1"
              />
              <line
                x1="80"
                y1="60"
                x2="65"
                y2="60"
                className="stroke-foreground/30"
                strokeWidth="1"
              />
            </svg>
          </Wrapper>
        );
      })}
    </div>
  );
}
