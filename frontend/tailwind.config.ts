import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Surface / background */
        "ny-bg":           "var(--ny-bg)",
        "ny-surface":      "var(--ny-surface)",
        /* Brand greens */
        "ny-forest":       "var(--ny-forest)",
        "ny-forest-deep":  "var(--ny-forest-deep)",
        /* Accent */
        "ny-accent":       "var(--ny-accent)",
        /* Text */
        "ny-text":         "var(--ny-text)",
        "ny-muted":        "var(--ny-muted)",
        "ny-border":       "var(--ny-border)",
        /* Status */
        status: {
          green: {
            DEFAULT: "var(--ny-status-green)",
            bg:      "var(--ny-status-green-bg)",
            border:  "var(--ny-status-green-border)",
          },
          amber: {
            DEFAULT: "var(--ny-status-amber)",
            bg:      "var(--ny-status-amber-bg)",
            border:  "var(--ny-status-amber-border)",
          },
          red: {
            DEFAULT: "var(--ny-status-red)",
            bg:      "var(--ny-status-red-bg)",
            border:  "var(--ny-status-red-border)",
          },
        },
      },
      borderRadius: {
        pill:    "9999px",
        card:    "22px",
        frame:   "36px",
        control: "12px",
        sm:      "6px",
        btn:     "9999px",   /* alias — existing code uses rounded-btn */
        input:   "12px",
      },
      boxShadow: {
        "ny-1": "var(--ny-shadow-1)",
        "ny-2": "var(--ny-shadow-2)",
        "ny-3": "var(--ny-shadow-3)",
      },
      fontFamily: {
        heading: ["var(--font-manrope)", "system-ui", "sans-serif"],
        body:    ["var(--font-inter)",   "system-ui", "sans-serif"],
        deva:    ["var(--font-noto-deva)", "var(--font-inter)", "system-ui", "sans-serif"],
        sans:    ["var(--font-inter)",   "system-ui", "sans-serif"],
      },
      fontSize: {
        /* Landing page fluid sizes (clamp values applied via CSS, these are fallbacks) */
        "ny-hero":    ["clamp(2.75rem,1.6rem + 4.6vw,5.75rem)", { lineHeight: "1.04", fontWeight: "800" }],
        "ny-section": ["clamp(2.2rem,1.5rem + 2.6vw,3.625rem)",  { lineHeight: "1.08", fontWeight: "800" }],
        "ny-xl":      ["clamp(1.25rem,1.1rem + 0.5vw,1.5rem)",   { lineHeight: "1.3" }],
        "ny-lg":      ["clamp(1.0625rem,1rem + 0.35vw,1.25rem)", { lineHeight: "1.5" }],
        /* Legacy aliases (keep existing pages building) */
        title:        ["26px", { lineHeight: "32px", fontWeight: "600" }],
        body:         ["15px", { lineHeight: "22px", fontWeight: "400" }],
        "muted-size": ["13px", { lineHeight: "18px", fontWeight: "400" }],
      },
      transitionTimingFunction: {
        "drawer-out": "cubic-bezier(0, 0, 0.2, 1)",
        "drawer-in":  "cubic-bezier(0.4, 0, 1, 1)",
      },
      zIndex: {
        page:   "0",
        topbar: "30",
        chat:   "40",
        drawer: "50",
        sheet:  "60",
        toast:  "70",
      },
    },
  },
  plugins: [],
};

export default config;
