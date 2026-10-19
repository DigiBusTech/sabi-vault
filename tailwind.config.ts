import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        sans: ["Montserrat", "sans-serif"],
      },
      colors: {
        background: "#ffffff",
        foreground: "#0f172a",
        brand: {
          green: "#059669",
          "green-hover": "#047857",
          "green-light": "#ecfdf5",
          dark: "#0f172a",
          "dark-subtle": "#1e293b",
          white: "#ffffff",
        },
      },
    },
  },
  plugins: [],
};
export default config;
