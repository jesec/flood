import {defineConfig} from '@pandacss/dev';

export default defineConfig({
  // Whether to use css reset - disabled since we use SASS reset
  preflight: false,

  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {},
  },

  // The output directory for your css system
  outdir: 'src/javascript/styled-system',
});
