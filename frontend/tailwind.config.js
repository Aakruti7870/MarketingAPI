/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#FBF6E4",
          100: "#F7E7A1",
          200: "#F5D77F",
          300: "#E5C158",
          400: "#D4AF37",
          500: "#C5A059",
          600: "#B8860B",
          700: "#997A15",
        },
        ink: "#090D16",
      },
      fontFamily: {
        heading: ["'Plus Jakarta Sans'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        gold: "0 4px 20px rgba(212, 175, 55, 0.25)",
        card: "0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.05)",
        hover: "0 10px 25px -5px rgba(15,23,42,0.08), 0 8px 10px -6px rgba(212,175,55,0.12)",
      },
      keyframes: {
        "fade-up": { "0%": { opacity: 0, transform: "translateY(8px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};
