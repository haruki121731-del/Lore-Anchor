/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 鉄の掟4: 色の「くすみ」と「濁り」
        paper: '#F5F2ED',
        'paper-aged': '#E8E4DC',
        ink: '#1A1916',
        'ink-faded': '#5C5851',
        'ink-pale': '#9A958C',
        terracotta: '#B54A3F',
        forest: '#2D5A4A',
        gold: '#C9A227',
        acid: '#FF3366',
        // shadcn/ui compatibility
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
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
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
      fontFamily: {
        display: ['"Inter Tight"', 'Helvetica Neue', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      // 鉄の掟1: デフォルト値の完全禁止 - 角丸は0かfullのみ
      borderRadius: {
        none: "0px",
        full: "9999px",
        xl: "0px",
        lg: "0px",
        md: "0px",
        sm: "0px",
        xs: "0px",
      },
      // 鉄の掟1: ソリッドシャドウのみ
      boxShadow: {
        solid: "8px 8px 0 0 #1A1916",
        "solid-sm": "4px 4px 0 0 #1A1916",
        "solid-lg": "12px 12px 0 0 #1A1916",
        inner: "inset 0 1px 0 0 rgba(255,255,255,0.1)",
      },
      // 鉄の掟3: タイポグラフィの緊張感
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        wide: '0.02em',
        wider: '0.04em',
        widest: '0.08em',
      },
      lineHeight: {
        tight: '0.95',
        snug: '1.1',
        normal: '1.4',
        relaxed: '1.6',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "radar-ping": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "75%, 100%": { transform: "scale(2)", opacity: "0" },
        },
        "mesh-blob": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "radar-ping": "radar-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "mesh-blob": "mesh-blob 20s ease-in-out infinite",
        "spin-slow": "spin-slow 8s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
