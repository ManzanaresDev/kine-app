import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      colors: {
        salmon: {
          50: "#fff4f2",
          100: "#ffe6e1",
          200: "#ffc9be",
          300: "#ffa494",
          400: "#ff7d6a",
          500: "#f95c47",
          600: "#e03a26",
          700: "#bc2b1a",
          800: "#9a2518",
          900: "#7f231a",
          950: "#450e09",
        },
      },
    },
  },
  plugins: [],
};

export default config;
