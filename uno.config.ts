import { defineConfig, presetWind4, transformerDirectives } from "unocss";
import { presetDaisy } from "@ameinhardt/unocss-preset-daisy";
// @ts-expect-error
import theme from 'daisyui/functions/variables.js';

export default defineConfig({
  presets: [
    presetDaisy(),
    presetWind4(),
  ],
  transformers: [
    transformerDirectives(),
  ],
  theme: {
    ...theme,
    font: {
      sans: "var(--quattro)",
      mono: "var(--intel-mono)",
      display: "var(--jacquard-12)",
    },
  },
});