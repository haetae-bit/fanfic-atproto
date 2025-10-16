import { ActionError, defineAction } from "astro:actions";
import { db, Chapters, Works, eq, Users, and } from "astro:db";
import schema from "./schema";

export default defineAction({
  accept: "form",
  input: schema.omit({ option: true, bskyUri: true, bskyTitle: true, leafletUri: true }),
  handler: async ({ title, content, authorsNotes, endNotes, warnings }, context) => {
    const loggedInUser = context.locals.loggedInUser;
    if (!loggedInUser) {
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "You're not logged in!",
      });
    }
        
    const workSlug = context.params["workId"];
    const chapterSlug = context.params["chapterId"];

    if (!workSlug || !chapterSlug) {
      throw new ActionError({
        code: "NOT_FOUND",
        message: `Cannot find the work or chapter by this slug`,
      });
    }

    const [result] = await db.select()
      .from(Chapters)
      .fullJoin(Works, eq(Chapters.workId, Works.id))
      .innerJoin(Users, eq(Works.author, loggedInUser.did))
      .having(and(
        eq(Works.slug, workSlug!),
        eq(Works.author, loggedInUser.did)
      ))
      .where(eq(Chapters.slug, chapterSlug))
      .limit(1);
    
    if (!result) {
      throw new ActionError({
        code: "NOT_FOUND",
        message: "This chapter was not found!",
      });
    }
  }
});