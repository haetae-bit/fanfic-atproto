import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, Tags, like } from "astro:db";

export default defineAction({
  accept: "json", // will switch this over to a form but i think json will be more extendable
  input: z.object({
    tags: z.string(),
  }),
  handler: async ({ tags }) => {
    console.log(tags);
    const existingTags = await db
      .select({ type: Tags.type, slug: Tags.slug, label: Tags.label })
      .from(Tags)
      .where(like(Tags.type, tags))
      .all();
    
    return existingTags;
  },
});