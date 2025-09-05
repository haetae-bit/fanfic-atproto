// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import node from '@astrojs/node';
import db from "@astrojs/db";
import fujocodedAuthproto from "@fujocoded/authproto";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    db(),
    fujocodedAuthproto({
      applicationName: "fan archive",
      applicationDomain: "localhost:4321",
      // driver: {
      //   name: "astro:db",
      // },
    })
  ],
  experimental: {
    fonts: [
      {
        provider: fontProviders.fontsource(),
        name: "IBM Plex Serif",
        cssVariable: "--junicode",
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