/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      colors: {
        rose: {
          50: "#fff5f7",
          100: "#ffe4eb",
        },
      },
    },
  },
  plugins: [],
};
