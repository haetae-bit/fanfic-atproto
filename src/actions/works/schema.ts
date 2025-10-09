import { z } from "astro:schema";

export default z.object({
  title: z.string(),
  summary: z.string(),
  tags: z.string(),
  publish: z.boolean(),
});