import { defineConfig, presetTypography, presetWind4, transformerDirectives, transformerVariantGroup } from "unocss";
import { presetDaisy } from "@ameinhardt/unocss-preset-daisy";
// @ts-ignore
import theme from 'daisyui/functions/variables.js';

export default defineConfig({
  presets: [
    presetWind4(),
    presetTypography(),
    presetDaisy({
      darkTheme: true,
    }),
  ],
  separators: [':'],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  theme: {
    ...theme,
  },
  extendTheme: (theme) => {
    theme.font.sans = "var(--quattro)";
    theme.font.serif = "var(--plex-serif)";
    theme.font.mono = "var(--intel-mono)";
    theme.font.dyslexic = "var(--dyslexic)";
    theme.font.display ="var(--jacquard-12)";
  },
});