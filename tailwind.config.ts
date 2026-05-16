import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Pretendard Variable"', '"Pretendard"', "system-ui", "sans-serif"],
        display: ['"Instrument Serif"', "serif"],
      },
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
        },
        tx: {
          primary: "var(--tx-primary)",
          secondary: "var(--tx-secondary)",
          tertiary: "var(--tx-tertiary)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          light: "var(--accent-light)",
          muted: "var(--accent-muted)",
        },
        income: "var(--income)",
        expense: "var(--expense)",
        border: "var(--border-color)",
      },
    },
  },
  plugins: [],
};
export default config;
