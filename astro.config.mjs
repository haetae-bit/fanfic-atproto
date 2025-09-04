// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  adapter: node({
    mode: 'standalone',
  }),
  env: {
    schema: {
      DB_URL: envField.string({ context: "server", access: "secret" }),
      DB_TOKEN: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },
  experimental: {
    fonts: [
      {
        provider: "local",
        name: "Junicode",
        cssVariable: "--junicode",
        variants: [
          {
            weight: "300 700",
            style: "normal",
            variationSettings: "'wdth' 100 125, 'ENLA' 0 1",
            src: ["./src/assets/fonts/JunicodeVF-Roman.woff2"],
          },
          {
            weight: "300 700",
            style: "italic",
            variationSettings: "'wdth' 100 125, 'ENLA' 0 1",
            src: ["./src/assets/fonts/JunicodeVF-Italic.woff2"],
          },
        ],
        fallbacks: [ 'Charter', 'Bitstream Charter', 'Sitka Text', 'Cambria', 'Georgia', "serif"],
      },
      {
        provider: fontProviders.fontsource(),
        name: "Atkinson Hyperlegible",
        cssVariable: "--atkinson",
      }
    ],
  },
});