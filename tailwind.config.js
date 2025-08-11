/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0A2A66",
        accent:  "#D0021B",
        light:   "#F2F6FF",
        white:   "#FFFFFF",
        navy:    "#1B2B52",
        royal:   "#214E9F",
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          500: '#2563eb',
          600: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
};

