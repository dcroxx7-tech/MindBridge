import React from "react";

/**
 * MindBridge brand logo — the purple lightning bolt.
 * Replaces all generic Brain icons used as brand marks.
 * 
 * @param {object} props
 * @param {"sm"|"md"|"lg"|"xl"} props.size - Size variant
 * @param {string} props.className - Additional CSS classes
 */
export default function MindBridgeLogo({ size = "md", className = "" }) {
  const sizes = {
    sm: { width: 20, height: 19 },
    md: { width: 28, height: 27 },
    lg: { width: 40, height: 38 },
    xl: { width: 56, height: 54 },
  };

  const { width, height } = sizes[size] || sizes.md;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 48 46"
      className={className}
      aria-label="MindBridge Logo"
    >
      <path
        fill="url(#mb-grad)"
        d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
      />
      <defs>
        <linearGradient id="mb-grad" x1="0" y1="0" x2="48" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
      </defs>
    </svg>
  );
}
