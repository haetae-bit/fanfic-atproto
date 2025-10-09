import { z } from "astro:schema";

export default z.object({
  uri: z.string().optional(), // this is in case someone wants to import a chapter
  title: z.string().optional(),
  notes: z.string().optional(),
  content: z.string().optional(),
});