/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0A2A66", // azul profundo
        accent:  "#D0021B", // rojo
        light:   "#F2F6FF", // blanco azulado
        white:   "#FFFFFF",
        navy:    "#1B2B52",
        royal:   "#214E9F",
      },
    },
  },
};

