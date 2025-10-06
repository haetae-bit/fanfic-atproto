import { defineConfig, presetTypography, presetWind4, presetIcons, transformerDirectives, type PresetWind4Theme } from "unocss";
import { presetDaisy } from "@ameinhardt/unocss-preset-daisy";
// @ts-expect-error
import theme from 'daisyui/functions/variables.js';

export default defineConfig<PresetWind4Theme>({
  outputToCssLayers: true,
  layers: {
    'properties': -6,
    'theme': -5,
    'base': -4,
    'daisy-base': -3,
    'daisy-components': -2,
    'shortcuts': -1,
    'default': 0,
    'typography': 1,
  },
  presets: [
    presetWind4(),
    presetDaisy(),
    presetIcons({
      collections: {
        lca: () => import("@iconify-json/lucide-lab/icons.json").then(i => i.default),
        lc: () => import("@iconify-json/lucide/icons.json").then(i => i.default),
      },
      extraProperties: {
        display: 'inline-block',
      }
    }),
    presetTypography({
      colorScheme: {
        "body": ["color-mix(in oklab,var(--color-base-content)80%,#0000)", "color-mix(in oklab,var(--color-base-content)80%,#0000)"],
        "headings": ["var(--color-base-content)", "var(--color-base-content)"],
        "lead": ["var(--color-base-content)", "var(--color-base-content)"],
        "links": ["var(--color-content)", "var(--color-content)"],
        "bold": ["var(--color-base-content)", "var(--color-base-content)"],
        "counters": ["var(--color-base-content)", "var(--color-base-content)"],
        "bullets": ["color-mix(in oklab,var(--color-base-content)50%,#0000)", "color-mix(in oklab,var(--color-base-content)50%,#0000)"],
        "hr": ["color-mix(in oklab,var(--color-base-content)20%,#0000)", "color-mix(in oklab,var(--color-base-content)20%,#0000)"],
        "quotes": ["var(--color-base-content)", "var(--color-base-content)"],
        "quote-borders": ["color-mix(in oklab,var(--color-base-content)20%,#0000)", "color-mix(in oklab,var(--color-base-content)20%,#0000)"],
        "captions": ["color-mix(in oklab,var(--color-base-content)50%,#0000)", "color-mix(in oklab,var(--color-base-content)50%,#0000)"],
        "kbd": ["color-mix(in oklab,var(--color-base-content)80%,#0000)", "color-mix(in oklab,var(--color-base-content)80%,#0000)"],
        "kbd-shadows": ["oklab(21% -.00316127 -.0338527/.1)", "oklab(21% -.00316127 -.0338527/.1)"],
        "code": ["var(--color-base-content)", "var(--color-base-content)"],
        "pre-code": ["var(--color-neutral-content)", "var(--color-neutral-content)"],
        "pre-bg": ["var(--color-neutral)", "var(--color-neutral)"],
        "th-borders": ["color-mix(in oklab,var(--color-base-content)50%,#0000)", "color-mix(in oklab,var(--color-base-content)50%,#0000)"],
        "td-borders": ["color-mix(in oklab,var(--color-base-content)20%,#0000)", "color-mix(in oklab,var(--color-base-content)20%,#0000)"]
      },
    }),
  ],
  separators: [":"],
  shortcuts: {
    "heading-1": "font-display text-5xl",
    "heading-2": "font-display text-4xl",
    "heading-3": "font-display text-3xl",
    "heading-4": "font-sans text-2xl",
    "heading-5": "font-sans text-xl",
    "heading-6": "font-sans text-lg",
  },
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
    leading: 1.5,
    text: {
      xs: {
        fontSize: "var(--step--2)",
      },
      sm: {
        fontSize: "var(--step--1)",
      },
      base: {
        fontSize: "var(--step-0)",
      },
      lg: {
        fontSize: "var(--step-1)",
      },
      xl: {
        fontSize: "var(--step-2)",
      },
      "2xl": {
        fontSize: "var(--step-3)",
      },
      "3xl": {
        fontSize: "var(--step-4)",
      },
      "4xl": {
        fontSize: "var(--step-5)",
      },
      "5xl": {
        fontSize: "var(--step-6)",
      },
      "6xl": {
        fontSize: "var(--step-7)",
      },
      "7xl": {
        fontSize: "var(--step-8)",
      },
      "8xl": {
        fontSize: "var(--step-9)",
      },
      "9xl": {
        fontSize: "var(--step-10)",
      },
    },
  },
});