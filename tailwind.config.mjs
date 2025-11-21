import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
 const config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [
    heroui({
      layout: {
        dividerWeight: "1px", 
        disabledOpacity: 0.45, 
        fontSize: {
          tiny: "0.75rem",   // 12px
          small: "0.875rem", // 14px
          medium: "0.9375rem", // 15px
          large: "1.125rem", // 18px
        },
        lineHeight: {
          tiny: "1rem", 
          small: "1.25rem", 
          medium: "1.5rem", 
          large: "1.75rem", 
        },
        radius: {
          small: "6px", 
          medium: "8px", 
          large: "12px", 
        },
        borderWidth: {
          small: "1px", 
          medium: "1px", 
          large: "2px", 
        },
      },
      themes: {
        light: {
          colors: {
            background: {
              DEFAULT: "#F8F9FA"
            },
            foreground: {
              DEFAULT: "#2C3E50"
            },
            divider: {
              DEFAULT: "rgba(44, 62, 80, 0.15)"
            },
            focus: {
              DEFAULT: "#1ABC9C"
            },
            content1: {
              DEFAULT: "#FFFFFF",
              foreground: "#2C3E50"
            },
            content2: {
              DEFAULT: "#F1F3F5",
              foreground: "#2C3E50"
            },
            content3: {
              DEFAULT: "#E9ECEF",
              foreground: "#2C3E50"
            },
            content4: {
              DEFAULT: "#DEE2E6",
              foreground: "#2C3E50"
            },
            default: {
              50: "#F8F9FA",
              100: "#F1F3F5",
              200: "#E9ECEF",
              300: "#DEE2E6",
              400: "#CED4DA",
              500: "#ADB5BD",
              600: "#6C757D",
              700: "#495057",
              800: "#343A40",
              900: "#212529",
              DEFAULT: "#ADB5BD",
              foreground: "#FFFFFF"
            },
            primary: {
              50: "#E8F8F5",
              100: "#D1F2EB",
              200: "#A3E4D7",
              300: "#76D7C4",
              400: "#48C9B0",
              500: "#1ABC9C",
              600: "#159A80",
              700: "#107360",
              800: "#0B4C3F",
              900: "#05261F",
              DEFAULT: "#1ABC9C",
              foreground: "#FFFFFF"
            },
            secondary: {
              50: "#EBF5FB",
              100: "#D6EAF8",
              200: "#AED6F1",
              300: "#85C1E9",
              400: "#5DADE2",
              500: "#2980B9",
              600: "#21618C",
              700: "#1A4C6F",
              800: "#12334A",
              900: "#091A25",
              DEFAULT: "#2980B9",
              foreground: "#FFFFFF"
            },
            success: {
              50: "#E8F8F5",
              100: "#D1F2EB",
              200: "#A3E4D7",
              300: "#76D7C4",
              400: "#48C9B0",
              500: "#1ABC9C",
              600: "#159A80",
              700: "#107360",
              800: "#0B4C3F",
              900: "#05261F",
              DEFAULT: "#1ABC9C",
              foreground: "#FFFFFF"
            },
            warning: {
              50: "#FEF9E7",
              100: "#FCF3CF",
              200: "#F9E79F",
              300: "#F7DC6F",
              400: "#F4D03F",
              500: "#F1C40F",
              600: "#C29D0B",
              700: "#927608",
              800: "#614E05",
              900: "#312703",
              DEFAULT: "#F1C40F",
              foreground: "#000000"
            },
            danger: {
              50: "#FDEDEC",
              100: "#FADBD8",
              200: "#F5B7B1",
              300: "#F1948A",
              400: "#EC7063",
              500: "#E74C3C",
              600: "#B93D30",
              700: "#8B2E24",
              800: "#5C1E18",
              900: "#2E0F0C",
              DEFAULT: "#E74C3C",
              foreground: "#FFFFFF"
            }
          }
        }
      }
    })
  ]
};

export default config;