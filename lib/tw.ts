import { create } from 'twrnc';

// Puedes extender colores para “brand”
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
