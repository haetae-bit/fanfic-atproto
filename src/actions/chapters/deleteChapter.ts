import { ActionError, defineAction } from "astro:actions";
import { and, Chapters, db, eq, Users, Works } from "astro:db";

export default defineAction({
  accept: "form",
  handler: async (_, context) => {
    const loggedInUser = context.locals.loggedInUser;
    if (!loggedInUser) {
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "You're not logged in!",
      });
    }
    
    const workSlug = context.params["workId"];
    const chapterSlug = context.params["chapterId"];
    const [result] = await db.select()
      .from(Chapters)
      .fullJoin(Works, eq(Chapters.workId, Works.id))
      .innerJoin(Users, eq(Works.author, loggedInUser.did))
      .having(and(
        eq(Works.slug, workSlug!),
        eq(Works.author, loggedInUser.did)
      ))
      .where(eq(Chapters.slug, chapterSlug!))
      .limit(1);
    
    if (!workSlug || !chapterSlug || !result) {
      throw new ActionError({
        code: "NOT_FOUND",
        message: "This chapter was not found!",
      });
    }
  },
});