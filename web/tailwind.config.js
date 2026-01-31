/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // 有機的デザイン：アースカラーとパステル基調
      colors: {
        // ベースカラー（オフホワイト、ベージュ系）
        cream: {
          50: "#FDFCF8",
          100: "#FAF8F2",
          200: "#F5F2E9",
          300: "#EEEBDE",
          400: "#E5E0D0",
        },
        // サンド/ベージュ
        sand: {
          50: "#FAF7F2",
          100: "#F5EFE6",
          200: "#EBE0D0",
          300: "#DECCB5",
          400: "#CEB596",
          500: "#B89978",
        },
        // セージグリーン（有機的な緑）
        sage: {
          50: "#F6F7F4",
          100: "#E8EBE4",
          200: "#D1D7C9",
          300: "#B3BEA6",
          400: "#94A382",
          500: "#788968",
          600: "#5E6D52",
          700: "#4A563F",
          800: "#36402E",
          900: "#222B1E",
        },
        // ミストブルー（穏やかな青）
        mist: {
          50: "#F5F7FA",
          100: "#E8EDF2",
          200: "#D1DBE6",
          300: "#B3C4D6",
          400: "#8FA6C1",
          500: "#6B88AA",
        },
        // ウォームステートカラー
        warm: {
          success: "#8FB996",
          warning: "#E6C9A8",
          danger: "#D4A5A5",
          info: "#A5B8D4",
        },
        // shadcn互換カラー（アースカラーにマッピング）
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // 有機的な角丸（徹底した丸み）
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
        full: "9999px",
      },
      // 人間味のあるフォント
      fontFamily: {
        sans: [
          "'Nunito Sans'",
          "'M PLUS Rounded 1c'",
          "'Hiragino Sans'",
          "'Yu Gothic'",
          "system-ui",
          "sans-serif",
        ],
        rounded: [
          "'M PLUS Rounded 1c'",
          "'Nunito Sans'",
          "'Hiragino Sans'",
          "sans-serif",
        ],
      },
      // 優しいアニメーション
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "gentle-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "soft-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "breathe": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "accordion-up": "accordion-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "gentle-bounce": "gentle-bounce 2s ease-in-out infinite",
        "soft-pulse": "soft-pulse 3s ease-in-out infinite",
        "float": "float 4s ease-in-out infinite",
        "breathe": "breathe 4s ease-in-out infinite",
        "slide-up": "slide-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "fade-in": "fade-in 0.4s ease-out",
      },
      // 有機的な影
      boxShadow: {
        "soft": "0 4px 20px -2px rgba(139, 125, 107, 0.15)",
        "soft-lg": "0 8px 30px -4px rgba(139, 125, 107, 0.2)",
        "soft-xl": "0 12px 40px -6px rgba(139, 125, 107, 0.25)",
        "inner-soft": "inset 0 2px 8px rgba(139, 125, 107, 0.1)",
        "glow": "0 0 20px rgba(143, 185, 150, 0.4)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
