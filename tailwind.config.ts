import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dzan: {
          cream: "#f5f0e8",
          warm: "#e8dcc8",
          brown: "#6b3d1e",
          amber: "#c8832a",
          earth: "#3d2a1a",
          sage: "#7a8c6e",
          stone: "#9e9488",
          dark: "#1a1208",
        },
      },
      fontFamily: {
        cormorant: ["var(--font-cormorant)", "serif"],
        jost: ["var(--font-jost)", "sans-serif"],
      },
      animation: {
    marquee: "marquee 20s linear infinite",
  },
  keyframes: {
    marquee: {
      from: { transform: "translateX(0)" },
      to: { transform: "translateX(-50%)" },
    },
  },
    },
  },
  plugins: [],
}

export default config