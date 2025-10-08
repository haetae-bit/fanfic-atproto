import { ActionError, defineAction } from "astro:actions";
import { db, like, Tags } from "astro:db";
import { z } from "astro:schema";

export const tagsActions = {
  fetchTags: defineAction({
    accept: "form",
    input: z.object({
      tags: z.string(),
    }),
    handler: async ({ tags }) => {
      console.log(tags);
      const existingTags = await db
        .select({ type: Tags.type, slug: Tags.slug })
        .from(Tags)
        .where(like(Tags.type, tags))
        .all();
      
      return existingTags;
    },
  }),
}