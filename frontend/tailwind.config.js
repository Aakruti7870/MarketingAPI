/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#F7F4FF",
          100: "#EEE8FF",
          200: "#DDD0FF",
          300: "#C4A7FF",
          400: "#9A6CFF",
          500: "#7C4DFF",
          600: "#673DE6",
          700: "#5130B5",
        },
        ink: "#17172A",
        blush: "#FF63B7",
        mist: "#F8F7FF",
      },
      fontFamily: {
        heading: ["'Plus Jakarta Sans'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        gold: "0 12px 34px rgba(124, 77, 255, 0.24)",
        brand: "0 14px 40px rgba(124, 77, 255, 0.23), 0 8px 24px rgba(255, 99, 183, 0.15)",
        soft: "0 18px 50px rgba(76, 59, 122, 0.10)",
        browser: "0 35px 90px rgba(75, 58, 120, 0.16)",
        card: "0 8px 30px rgba(76,59,122,0.08)",
        hover: "0 16px 40px rgba(124,77,255,0.13)",
      },
      keyframes: {
        "fade-up": { "0%": { opacity: 0, transform: "translateY(8px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        float: { "0%, 100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-10px)" } },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        shimmer: "shimmer 2.5s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
