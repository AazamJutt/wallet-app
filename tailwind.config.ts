import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/context/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07070c",
          900: "#0b0b14",
          850: "#101018",
          800: "#15151f",
          700: "#1d1d2a",
          600: "#2a2a3a",
        },
        haze: "#9a9ab3",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'SF Pro Text'",
          "'Segoe UI'",
          "Inter",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 20px 45px -12px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.35)",
        "card-lg": "0 30px 70px -15px rgba(0,0,0,0.65), 0 4px 10px rgba(0,0,0,0.4)",
        glow: "0 0 0 1px rgba(255,255,255,0.06) inset, 0 0 40px -10px rgba(120,120,255,0.25)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        "sheet-in": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.94) translateY(6px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "sheet-in": "sheet-in 0.38s cubic-bezier(0.32, 0.72, 0, 1)",
        "fade-in": "fade-in 0.25s ease-out",
        "pop-in": "pop-in 0.28s cubic-bezier(0.32, 0.72, 0, 1)",
        shimmer: "shimmer 2.2s infinite linear",
      },
    },
  },
  plugins: [],
};

export default config;
