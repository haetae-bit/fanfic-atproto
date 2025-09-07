// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import node from '@astrojs/node';
import db from "@astrojs/db";
import fujocodedAuthproto from "@fujocoded/authproto";
import tailwindcss from "@tailwindcss/vite";

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
  vite: {
    plugins: [tailwindcss()],
  },
  experimental: {
    fonts: [
      {
        provider: fontProviders.fontsource(),
        name: "IBM Plex Serif",
        cssVariable: "--plex-serif",
        fallbacks: [ 'Charter', 'Bitstream Charter', 'Sitka Text', 'Cambria', 'Georgia', "serif"],
      },
      {
        provider: fontProviders.fontsource(),
        name: "IBM Plex Mono",
        cssVariable: "--plex-mono",
      },
      {
        provider: fontProviders.fontsource(),
        name: "Atkinson Hyperlegible",
        cssVariable: "--atkinson",
      },
      {
        provider: "local",
        name: "OpenDyslexic",
        cssVariable: "--dyslexic",
        variants: [
          {
            src: [
              "./src/assets/fonts/opendyslexic/OpenDyslexic-Regular.otf",
              "./src/assets/fonts/opendyslexic/OpenDyslexic-Regular.woff",
              "./src/assets/fonts/opendyslexic/OpenDyslexic-Regular.woff2",
            ],
            weight: 400,
            style: "normal"
          },
          {
            src: [
              "./src/assets/fonts/opendyslexic/OpenDyslexic-Italic.otf",
              "./src/assets/fonts/opendyslexic/OpenDyslexic-Italic.woff",
              "./src/assets/fonts/opendyslexic/OpenDyslexic-Italic.woff2",
            ],
            weight: 400,
            style: "italic",
          },
          {
            src: [
              "./src/assets/fonts/opendyslexic/OpenDyslexic-Bold.otf",
              "./src/assets/fonts/opendyslexic/OpenDyslexic-Bold.woff",
              "./src/assets/fonts/opendyslexic/OpenDyslexic-Bold.woff2",
            ],
            weight: 700,
            style: "normal",
          },
          {
            src: [
              "./src/assets/fonts/opendyslexic/OpenDyslexic-Bold-Italic.otf",
              "./src/assets/fonts/opendyslexic/OpenDyslexic-Bold-Italic.woff",
              "./src/assets/fonts/opendyslexic/OpenDyslexic-Bold-Italic.woff2",
            ],
            weight: 700,
            style: "italic",
          },
        ],
      }
    ],
  },
});