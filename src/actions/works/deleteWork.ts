import { defineAction, ActionError } from "astro:actions";
import { db, Works, and, eq } from "astro:db";
import { getAgent, client } from "@/lib/atproto";
import { AtUri } from "@atproto/api";

export default defineAction({
  accept: "form",
  handler: async (_, context) => {
    const workId = context.params["workId"];
    const loggedInUser = context.locals.loggedInUser;

    //#region "Check authentication and if the work exists"
    if (!workId) {
      throw new ActionError({
        code: "NOT_FOUND",
        message: "Work slug not found!",
      });
    }

    if (!loggedInUser) {
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "You're not logged in!",
      });
    }

    const [work] = await db.select().from(Works)
      .where(and(
        eq(Works.slug, workId),
        eq(Works.author, loggedInUser.did)
      ))
      .limit(1);
    
    if (!work) {
      throw new ActionError({
        code: "NOT_FOUND",
        message: "Could not find the work!",
      });
    }
    //#endregion 
    //#region "If a work is public, delete the record from ATProto"
    if (work.uri) {
      try {
        const { rkey, host } = new AtUri(work.uri);
        const agent = await getAgent(context.locals);

        if (!agent) {
          console.error("Agent not found!");
          throw new ActionError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong when connecting to your PDS.",
          });
        }

        if (loggedInUser.did !== host) {
          throw new ActionError({
            code: "UNAUTHORIZED",
            message: "You can only delete works that you own!",
          });
        }

        // we'll just smush this in and pray
        await client.fan.fics.work.deleteRecord(rkey);
      } catch (error) {
        console.error(error);
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Something went wrong with deleting your fic from your PDS!",
        });
      }
    }
    //#endregion
    //#region "Delete the work from the database"
    const [result] = await db.delete(Works)
      .where(and(
        eq(Works.slug, workId!),
        eq(Works.author, loggedInUser.did)
      ))
      .returning();
    
    return result;
    //#endregion
  },
});