const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [path.join(__dirname, "src/**/*.{js,ts,jsx,tsx,mdx}")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Cradle dark theme - deep space aesthetic (required for interaction panels)
        forge: {
          bg: '#050508',
          surface: '#0c0c12',
          elevated: '#141420',
          border: '#1e1e2e',
          muted: '#5a5a7a',
          text: '#e4e4ef',
        },
        accent: {
          cyan: '#00d4ff',
          magenta: '#c026d3',
          lime: '#22c55e',
          amber: '#f59e0b',
          coral: '#f43f5e',
          purple: '#8b5cf6',
        },
        node: {
          contracts: '#00d4ff',
          payments: '#f59e0b',
          agents: '#c026d3',
          app: '#22c55e',
          quality: '#f43f5e',
          intelligence: '#8b5cf6',
        },
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};