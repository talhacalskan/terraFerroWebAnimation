import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#070707",
        accent: "#22d3ee",
      },
      boxShadow: {
        glass: "0 24px 120px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
