import React from 'react';

/**
 * ShopNow brand logo: a gradient shopping-bag mark plus the wordmark.
 *
 * @param {number} size   pixel size of the square mark (default 36)
 * @param {boolean} light render the wordmark in white (for dark backgrounds)
 * @param {boolean} showText whether to render the "ShopNow" wordmark
 */
const Logo = ({ size = 36, light = false, showText = true }) => (
  <span className="flex items-center gap-2">
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="shopnow-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" />
          <stop offset="1" stopColor="#c026d3" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#shopnow-grad)" />
      {/* shopping bag */}
      <path
        d="M15 18h18l-1.4 14.2A3 3 0 0 1 28.6 35H19.4a3 3 0 0 1-3-2.8L15 18Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M19.5 18v-1.5a4.5 4.5 0 0 1 9 0V18"
        stroke="#6d28d9"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="20" cy="23" r="1.4" fill="#7c3aed" />
      <circle cx="28" cy="23" r="1.4" fill="#7c3aed" />
    </svg>
    {showText && (
      <span className={`text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink-900'}`}>
        Shop<span className="text-accent-500">Now</span>
      </span>
    )}
  </span>
);

export default Logo;
