import sharedConfig from "@repo/tailwind-config";
import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  presets: [sharedConfig],
  plugins: [tailwindcssAnimate],
};
