import { z } from "astro:schema";

export default z.object({
  // order: z.number({ coerce: true }), // this could be useful for reordering chapters
  option: z.enum(["manual", "bsky", "leaflet"]),
  bskyUri: z.string().optional(), // this is in case someone wants to import a chapter
  bskyTitle: z.string().optional(),
  leafletUri: z.string().optional(),
  title: z.string().optional(),
  warnings: z.string().nullable(),
  authorsNotes: z.string().nullable(),
  endNotes: z.string().nullable(),
  content: z.string().optional(),
});