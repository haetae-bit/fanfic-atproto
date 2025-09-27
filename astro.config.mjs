// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import node from '@astrojs/node';
import db from "@astrojs/db";
import authproto from "@fujocoded/authproto";
import unocss from "unocss/astro";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    db(),
    authproto({
      applicationName: "fan archive",
      applicationDomain: "localhost:4321",
      driver: {
        name: "astro:db",
      },
      scopes: {
        genericData: true,
      },
    }),
    unocss(),
  ],
  experimental: {
    fonts: [
      {
        provider: fontProviders.fontsource(),
        name: "IBM Plex Serif",
        cssVariable: "--plex-serif",
      },
      {
        provider: fontProviders.fontsource(),
        name: "Libertinus Serif",
        cssVariable: "--libertinus-serif",
      },
      {
        provider: fontProviders.fontsource(),
        name: "Noto Serif",
        cssVariable: "--noto-serif",
      },
      {
        provider: fontProviders.fontsource(),
        name: "Lora",
        cssVariable: "--lora",
      },
      {
        provider: fontProviders.fontsource(),
        name: "iA Writer Mono",
        cssVariable: "--writer-mono",
      },
      {
        provider: fontProviders.fontsource(),
        name: "Intel One Mono",
        cssVariable: "--intel-mono",
      },
      {
        provider: fontProviders.fontsource(),
        name: "Recursive",
        cssVariable: "--recursive",
        styles: ["oblique", "normal"],
        weights: [300, 1000],
        variationSettings: "'slnt' -15 0, 'CASL' 0 1, 'CRSV' 0 1, 'MONO' 0 1",
      },
      {
        provider: fontProviders.fontsource(),
        name: "iA Writer Quattro",
        cssVariable: "--quattro",
      },
      {
        provider: fontProviders.fontsource(),
        name: "Sora",
        cssVariable: "--sora",
      },
      {
        provider: fontProviders.fontsource(),
        name: "Readex Pro",
        cssVariable: "--readex",
      },
      {
        provider: fontProviders.fontsource(),
        name: "Atkinson Hyperlegible Next",
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
      },
      {
        provider: fontProviders.fontsource(),
        name: "Jacquard 12",
        cssVariable: "--jacquard-12",
      },
    ],
  },
});