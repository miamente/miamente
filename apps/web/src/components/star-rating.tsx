"use client";
import React from "react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  disabled?: boolean;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  disabled = false,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange && !disabled) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const starRating = index + 1;
        const isFilled = starRating <= rating;
        const isHalfFilled = starRating === Math.ceil(rating) && rating % 1 !== 0;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleStarClick(starRating)}
            disabled={!interactive || disabled}
            className={`${sizeClasses[size]} ${
              interactive && !disabled
                ? "cursor-pointer transition-transform hover:scale-110"
                : "cursor-default"
            } ${
              isFilled
                ? "text-yellow-400"
                : isHalfFilled
                  ? "text-yellow-400"
                  : "text-neutral-300 dark:text-neutral-600"
            }`}
            aria-label={`${starRating} estrella${starRating > 1 ? "s" : ""}`}
          >
            {isHalfFilled ? "☆" : "★"}
          </button>
        );
      })}
    </div>
  );
}
