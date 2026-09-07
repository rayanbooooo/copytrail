import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#000000",
          raised: "#0A0B0D",
        },
        surface: {
          DEFAULT: "#101114",
          hover: "#17191E",
        },
        hairline: "rgba(255,255,255,0.07)",
        "hairline-soft": "rgba(255,255,255,0.035)",
        emerald: {
          signal: "#19E38C",
          deep: "#059669",
        },
        rose: {
          signal: "#FB7185",
          deep: "#E11D48",
        },
        ink: {
          DEFAULT: "#F4F5F7",
          muted: "#9CA1AF",
          faint: "#5B606E",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["IBM Plex Mono", "SF Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        "glow-emerald": "0 0 24px -4px rgba(52,211,153,0.35)",
        "glow-rose": "0 0 24px -4px rgba(251,113,133,0.35)",
        elevate: "0 12px 32px -12px rgba(0,0,0,0.55)",
      },
      backdropBlur: {
        xl2: "24px",
      },
      keyframes: {
        pulseSlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
      animation: {
        "pulse-slow": "pulseSlow 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
