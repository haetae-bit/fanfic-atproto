// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import node from '@astrojs/node';
import db from "@astrojs/db";
import authproto from "@fujocoded/authproto";

// https://astro.build/config
export default defineConfig({
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    db(),
    authproto({
      applicationName: "fan archive",
      applicationDomain: "",
      driver: { name: "astro:db" },
    }),
  ],
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