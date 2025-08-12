import { create } from 'twrnc';

// Extiende colores "brand" usados en el tema
const tw = create({
  theme: {
    extend: {
      colors: {
        brand: {
          600: '#1d4ed8',
          500: '#2563eb',
        },
      },
    },
  },
});

export default tw;
