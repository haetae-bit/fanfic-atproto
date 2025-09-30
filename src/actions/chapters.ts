import { addChapter } from "@/lib/db";
import { ActionError, defineAction } from "astro:actions"
import { db, eq, Works } from "astro:db";
import { z } from "astro:schema"

const chapterSchema = z.object({
  title: z.string(),
  notes: z.string().optional(),
  content: z.string(),
  publish: z.boolean(),
});

export const chaptersActions = {
  addChapter: defineAction({
    accept: "form",
    input: chapterSchema,
    handler: async (input, context) => {
      const workSlug = context.params["workId"];
      if (!workSlug) {
        throw new ActionError({
          message: "Work slug not found!",
          code: "NOT_FOUND",
        });
      }

      const [work] = await db.select({ id: Works.id })
        .from(Works)
        .where(eq(Works.slug, workSlug))
        .limit(1);
      
      if (!work) {
        throw new ActionError({
          message: "Work not found!",
          code: "NOT_FOUND",
        });
      }
      
      await addChapter(
        work.id,
        input.title,
        input.content,
        input.notes,
      );
    },
  }),
}